import type * as CAH from "types";
import type * as SocketIO from "socket.io";
import type * as pg from "pg";

import { ERROR_TYPES, NOTIFICATION_TYPES } from "../consts/error";
import {
    GAME_NAME_GENERATOR_MAX_RUNS,
    gameOptions,
} from "../consts/gameSettings";
import {
    appointNextCardCzar,
    getActivePlayers,
    getPlayersWithState,
    getRoundWinner,
    resetPlayers,
    setPlayersWaiting,
    updatePlayersIndividually,
} from "./player";
import {
    changeGameStateAfterTime,
    clearGameTimer,
    getPassedTime,
} from "./delayedStateChange";
import {
    createDBGame,
    deleteDBGame,
    getDBGame,
    getDBGameByPlayerId,
    getDBGameBySocketId,
    getDBGameIds,
    setDBGame,
} from "../db/database";
import { dealBlackCards, replenishWhiteCards, shuffleCards } from "./card";
import {
    validateCardCzar,
    validateGameEnding,
    validateGameStartRequirements,
    validateHost,
    validateOptions,
} from "./validate";

import hri from "human-readable-ids";
import { newGameTemplate } from "./newGame";
import { randomBetween } from "./util";
import { sendNotification } from "./socket";
import { setPopularVoteLeader } from "./popularVote";

let games: CAH.Game[] = [];

export const createGame = async (client: pg.PoolClient) => {
    const gameNames = await getGameIds(client);
    let gameURL = undefined;
    for (let i = 0, limit = GAME_NAME_GENERATOR_MAX_RUNS; i < limit; i++) {
        const newURL = hri.hri.random();
        if (!gameNames.includes(newURL)) {
            gameURL = newURL;
            break;
        }
    }

    if (!gameURL) return undefined;
    const newGame = newGameTemplate(gameURL);

    if (process.env.USE_DB) {
        await createDBGame(newGame, client);
    } else {
        games = [...games, newGame];
    }
    return newGame;
};

export const getGameIds = async (client: pg.PoolClient) => {
    if (process.env.USE_DB) {
        const result = await getDBGameIds(client);
        const gameNames = result.rows.map((row) => row.gameid);
        return gameNames;
    } else {
        return games.map((game) => game.id);
    }
};

export const getGame = async (gameID: string, client?: pg.PoolClient) => {
    if (process.env.USE_DB) {
        const game = await getDBGame(gameID, client);
        return game;
    } else {
        const game = games.find((game) => game.id === gameID);
        return game;
    }
};

export const setGame = async (newGame: CAH.Game, client?: pg.PoolClient) => {
    if (process.env.USE_DB && client) {
        await setDBGame(newGame, client);
    } else {
        games = games.map((game) => {
            return game.id === newGame.id ? newGame : game;
        });
    }
    return newGame;
};

export const removeGameIfNoActivePlayers = async (gameID: string) => {
    const game = await getGame(gameID);
    if (!game) return;

    if (!game.players || getActivePlayers(game.players).length === 0) {
        await removeGame(gameID);
    }
};

export const removeGame = async (gameID: string, client?: pg.PoolClient) => {
    if (process.env.USE_DB && client) {
        await deleteDBGame(gameID, client);
    } else {
        games = games.filter((game) => game.id !== gameID);
    }
};

export const createRound = (
    roundNumber: number,
    blackCard: CAH.BlackCard,
    cardCzarID: string
) => {
    return {
        round: roundNumber,
        blackCard: blackCard,
        cardCzar: cardCzarID,
        cardIndex: 0,
        whiteCardsByPlayer: [],
    };
};

export const everyoneHasPlayedTurn = (game: CAH.Game) => {
    const waitingPlayers = game.players.filter(
        (player) => player.state === "waiting" && !player.isCardCzar
    );
    return waitingPlayers.length === getActivePlayers(game.players).length - 1; // Remove card czar with -1
};

export const updateGameOptions = async (
    io: SocketIO.Server,
    socket: SocketIO.Socket,
    gameID: string,
    playerID: string,
    newOptions: CAH.Options,
    client?: pg.PoolClient
) => {
    const game = await getGame(gameID, client);

    if (!game) return;
    if (!validateHost(game, playerID)) {
        sendNotification(
            ERROR_TYPES.forbiddenHostAction,
            NOTIFICATION_TYPES.error,
            { socket: socket }
        );
        return;
    }

    game.client.options = validateOptions({
        ...game.client.options,
        ...newOptions,
    });

    await setGame(game, client);

    io.in(gameID).emit("update_game_options", {
        options: game.client.options,
    });
};

export const startGame = async (
    io: SocketIO.Server,
    socket: SocketIO.Socket,
    gameID: string,
    playerID: string,
    client?: pg.PoolClient
) => {
    const game = await getGame(gameID, client);
    if (!game) return undefined;

    if (!validateHost(game, playerID)) return undefined;

    const { error } = validateGameStartRequirements(game);
    if (!!error) {
        sendNotification(error, NOTIFICATION_TYPES.error, { socket: socket });
        return;
    }

    game.stateMachine.startGame();
    game.client.state = game.stateMachine.state;

    const activePlayers = getActivePlayers(game.players);
    const cardCzarIndex = randomBetween(0, activePlayers.length - 1);
    game.players = game.players.map((player) =>
        player.id === activePlayers[cardCzarIndex].id
            ? { ...player, isCardCzar: true }
            : player
    );
    game.players = setPlayersWaiting(game.players);

    game.cards.whiteCards = shuffleCards([...game.cards.whiteCards]);
    game.cards.blackCards = shuffleCards([...game.cards.blackCards]);

    const gameWithStartingHands = replenishWhiteCards(game, io);

    const newGame = dealBlackCards(
        io,
        activePlayers[cardCzarIndex].sockets,
        gameWithStartingHands
    );

    const updatedGame = changeGameStateAfterTime(
        io,
        newGame,
        "startPlayingWhiteCards"
    );

    await setGame(updatedGame, client);
    updatePlayersIndividually(io, updatedGame);
};

export const startNewRound = async (
    io: SocketIO.Server,
    socket: SocketIO.Socket | null,
    gameID: string,
    playerID: string,
    client?: pg.PoolClient
) => {
    let game = await getGame(gameID, client);
    if (!game) return undefined;

    if (!validateCardCzar(game, playerID)) {
        if (!!socket) {
            sendNotification(
                ERROR_TYPES.forbiddenCardCzarAction,
                NOTIFICATION_TYPES.error,
                { socket: socket }
            );
        }
        return;
    }

    if (validateGameEnding(game)) {
        await endGame(io, game);
        return;
    }

    if (game.stateMachine.cannot("startRound")) {
        if (!!socket) {
            sendNotification(
                ERROR_TYPES.incorrectGameState,
                NOTIFICATION_TYPES.error,
                { socket: socket }
            );
        }
        return;
    }

    game.stateMachine.startRound();
    game.client.state = game.stateMachine.state;

    game = replenishWhiteCards(game);

    if (game.client.options.winnerBecomesCardCzar && game.currentRound) {
        const winnerID = getRoundWinner(game.currentRound);
        game.players = appointNextCardCzar(game, playerID, winnerID);
    } else {
        game.players = appointNextCardCzar(game, playerID);
    }

    game.players = setPopularVoteLeader(game.players);
    game.players = setPlayersWaiting(game.players);

    const cardCzar = game.players.find((player) => player.isCardCzar);
    game = dealBlackCards(io, cardCzar.sockets, game);

    game = changeGameStateAfterTime(io, game, "startPlayingWhiteCards");
    await setGame(game, client);
    updatePlayersIndividually(io, game);
};

export const endGame = async (io: SocketIO.Server, game: CAH.Game) => {
    if (game.stateMachine.can("endGame")) {
        game.stateMachine.endGame();
        game.client.state = game.stateMachine.state;

        const updatedGame = clearGameTimer(game);

        await setGame(updatedGame);
        updatePlayersIndividually(io, updatedGame);
    }
};

export const skipRound = async (
    io: SocketIO.Server,
    game: CAH.Game,
    newCardCzar: CAH.Player,
    client?: pg.PoolClient
) => {
    const newGame = replenishWhiteCards(game);

    newGame.stateMachine.skipRound();
    newGame.client.state = newGame.stateMachine.state;

    newGame.players = setPlayersWaiting(newGame.players);

    const newerGame = dealBlackCards(io, newCardCzar.sockets, newGame);

    const updatedGame = changeGameStateAfterTime(
        io,
        newerGame,
        "startPlayingWhiteCards"
    );
    await setGame(updatedGame, client);
    updatePlayersIndividually(io, updatedGame);
};

export const findGameAndPlayerBySocketID = async (
    socketID: string,
    client?: pg.PoolClient
) => {
    if (process.env.USE_DB && client) {
        const game = await getDBGameBySocketId(socketID, client);
        if (!game) return undefined;

        const player = game.players.find((player) =>
            player.sockets.includes(socketID)
        );
        return { game, player };
    } else {
        for (let i = 0, gameCount = games.length; i < gameCount; i++) {
            for (
                let j = 0, playerCount = games[i].players.length;
                j < playerCount;
                j++
            ) {
                if (games[i].players[j].sockets.includes(socketID)) {
                    return {
                        game: { ...games[i] },
                        player: { ...games[i].players[j] },
                    };
                }
            }
        }
    }
    return undefined;
};

export const findGameByPlayerID = async (
    playerID: string,
    client?: pg.PoolClient
) => {
    if (process.env.USE_DB && client) {
        const game = await getDBGameByPlayerId(playerID, client);
        return game;
    } else {
        for (let i = 0, gameCount = games.length; i < gameCount; i++) {
            for (
                let j = 0, playerCount = games[i].players.length;
                j < playerCount;
                j++
            ) {
                if (games[i].players[j].id === playerID) {
                    return { ...games[i] };
                }
            }
        }
    }
    return undefined;
};

export const shouldGameBeDeleted = (game: CAH.Game) => {
    if (game.stateMachine.state === "lobby") {
        return game.players.every((player) =>
            ["disconnected", "spectating"].includes(player.state)
        );
    } else {
        return false;
    }
};

export const shouldReturnToLobby = (game: CAH.Game) => {
    if (game.stateMachine.state !== "lobby") {
        const activePlayers = getActivePlayers(game.players);
        if (activePlayers.length < gameOptions.minimumPlayers) {
            return true;
        }
        return game.players.every((player) =>
            ["disconnected", "pickingName", "spectating"].includes(player.state)
        );
    } else {
        return false;
    }
};

export const shouldSkipRound = (game: CAH.Game) => {
    if (game.stateMachine.state !== "lobby") {
        const activePlayerCount = getActivePlayers(game.players).length;
        const joiningPlayerCount = getPlayersWithState(game.players, "joining")
            .length;
        return (
            activePlayerCount < gameOptions.minimumPlayers &&
            activePlayerCount + joiningPlayerCount >= gameOptions.minimumPlayers
        );
    } else {
        return false;
    }
};

export const returnToLobby = async (
    io: SocketIO.Server,
    game: CAH.Game,
    client?: pg.PoolClient
) => {
    game.stateMachine.returnToLobby();
    game.client.state = game.stateMachine.state;

    const initialGame = resetGame(game);
    await setGame(initialGame, client);

    updatePlayersIndividually(io, initialGame);
};

export const validateHostAndReturnToLobby = async (
    io: SocketIO.Server,
    socket: SocketIO.Socket,
    gameID: string,
    playerID: string,
    client?: pg.PoolClient
) => {
    const game = await getGame(gameID, client);
    if (!game) return;

    if (!validateHost(game, playerID)) {
        sendNotification(
            ERROR_TYPES.forbiddenHostAction,
            NOTIFICATION_TYPES.error,
            { socket: socket }
        );
        return;
    }

    await returnToLobby(io, game, client);
};

export const resetGame = (game: CAH.Game) => {
    // Clear timeout
    const updatedGame = clearGameTimer(game);

    // Reset rounds
    updatedGame.client.rounds = [];
    updatedGame.currentRound = undefined;

    // Reset playerStates, scores, cardczar status and player white cards
    updatedGame.players = resetPlayers(updatedGame.players);

    // Reset played cards back to deck
    updatedGame.cards.whiteCards = [
        ...updatedGame.cards.whiteCards,
        ...updatedGame.cards.playedWhiteCards,
    ];
    updatedGame.cards.blackCards = [
        ...updatedGame.cards.blackCards,
        ...updatedGame.cards.playedBlackCards,
    ];

    // Reset timers
    updatedGame.client.timers.duration = undefined;
    updatedGame.client.timers.passedTime = undefined;

    // Reset game state if not in lobby
    if (updatedGame.stateMachine.state !== "lobby") {
        updatedGame.stateMachine.returnToLobby();
    }

    return updatedGame;
};

export const updateTimers = (io: SocketIO.Server, game: CAH.Game) => {
    io.in(game.id).emit("update_timers", {
        timers: {
            duration: game.client.timers.duration,
            passedTime: getPassedTime(game.id),
        },
    });
};

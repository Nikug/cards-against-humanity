import { ERROR_TYPES, NOTIFICATION_TYPES } from "../consts/error.js";
import {
    appointNextCardCzar,
    getActivePlayers,
    getPlayersWithState,
    getRoundWinner,
    handleJoiningPlayers,
    resetPlayers,
    setPlayersWaiting,
    updatePlayersIndividually,
} from "./player.js";
import {
    changeGameStateAfterTime,
    clearGameTimer,
    getPassedTime,
} from "./delayedStateChange.js";
import {
    createDBGame,
    deleteDBGame,
    getDBGame,
    getDBGameBySocketId,
    setDBGame,
} from "../db/database.js";
import {
    dealBlackCards,
    dealStartingWhiteCards,
    dealWhiteCards,
    replenishWhiteCards,
    shuffleCards,
} from "./card.js";
import {
    validateCardCzar,
    validateGameEnding,
    validateGameStartRequirements,
    validateHost,
    validateOptions,
} from "./validate.js";

import { gameOptions } from "../consts/gameSettings.js";
import hri from "human-readable-ids";
import { newGameTemplate } from "./newGame.js";
import { randomBetween } from "./util.js";
import { sendNotification } from "./socket.js";
import { setPopularVoteLeader } from "./popularVote.js";

let games = [];

export const createGame = async () => {
    const gameURL = hri.hri.random();
    const newGame = newGameTemplate(gameURL);

    if (process.env.USE_DB) {
        await createDBGame(newGame);
    } else {
        games = [...games, newGame];
    }
    return newGame;
};

export const getGame = async (gameID) => {
    if (process.env.USE_DB) {
        const game = await getDBGame(gameID);
        console.log("Getting game!", game.stateMachine.state);
        return game;
    } else {
        const game = games.find((game) => game.id === gameID);
        return game;
    }
};

export const setGame = async (newGame) => {
    if (process.env.USE_DB) {
        console.log("Setting game!", newGame.stateMachine.state);
        await setDBGame(newGame);
    } else {
        games = games.map((game) => {
            return game.id === newGame.id ? newGame : game;
        });
    }
    return newGame;
};

export const removeGameIfNoActivePlayers = async (gameID) => {
    const game = await getGame(gameID);
    if (!game) return;

    if (!game.players) removeGame(gameID);

    if (getActivePlayers(game.players).length === 0) {
        console.log("Removed inactive game", gameID);
        removeGame(gameID);
    }
};

export const removeGame = (gameID) => {
    console.log("Game was removed");
    if (process.env.USE_DB) {
        deleteDBGame(gameID);
    } else {
        games = games.filter((game) => game.id !== gameID);
    }
};

export const createRound = (roundNumber, blackCard, cardCzarID) => {
    return {
        round: roundNumber,
        blackCard: blackCard,
        cardCzar: cardCzarID,
        cardIndex: 0,
        whiteCardsByPlayer: [],
    };
};

export const everyoneHasPlayedTurn = (game) => {
    const waitingPlayers = game.players.filter(
        (player) => player.state === "waiting" && !player.isCardCzar
    );
    return waitingPlayers.length === getActivePlayers(game.players).length - 1; // Remove card czar with -1
};

export const updateGameOptions = async (
    io,
    socket,
    gameID,
    playerID,
    newOptions
) => {
    const game = await getGame(gameID);

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

    setGame(game);

    io.in(gameID).emit("update_game_options", {
        options: game.client.options,
    });
};

export const startGame = async (io, socket, gameID, playerID) => {
    const game = await getGame(gameID);
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

    const gameWithStartingHands = dealStartingWhiteCards(
        io,
        game,
        gameOptions.startingWhiteCardCount
    );

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

    console.log("Start game setting game!");
    setGame(updatedGame);
    updatePlayersIndividually(io, updatedGame);
};

export const startNewRound = async (io, socket, gameID, playerID) => {
    const game = await getGame(gameID);
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
        endGame(io, game);
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

    game.players = dealWhiteCards(
        game,
        game.currentRound.blackCard.whiteCardsToPlay
    );

    game.players = handleJoiningPlayers(io, game);

    if (game.client.options.winnerBecomesCardCzar && game.currentRound) {
        const winnerID = getRoundWinner(game.currentRound);
        game.players = appointNextCardCzar(game, playerID, winnerID);
    } else {
        game.players = appointNextCardCzar(game, playerID);
    }

    game.players = setPopularVoteLeader(game.players);
    game.players = setPlayersWaiting(game.players);

    const cardCzar = game.players.find((player) => player.isCardCzar);
    const newGame = dealBlackCards(io, cardCzar.sockets, game);

    const updatedGame = changeGameStateAfterTime(
        io,
        newGame,
        "startPlayingWhiteCards"
    );
    setGame(updatedGame);
    updatePlayersIndividually(io, updatedGame);
};

export const endGame = (io, game) => {
    if (game.stateMachine.can("endGame")) {
        game.stateMachine.endGame();
        game.client.state = game.stateMachine.state;

        const updatedGame = clearGameTimer(game);

        setGame(updatedGame);
        updatePlayersIndividually(io, updatedGame);
    }
};

export const skipRound = (io, game, newCardCzar) => {
    if (game.stateMachine.state === "pickingBlackCard") {
    } else if (game.stateMachine.state === "endRound") {
    } else if (game.stateMachine.state === "playingWhiteCards") {
        const playerCards = game.currentRound.whiteCardsByPlayer.map(
            (player) => ({ id: player.playerID, whiteCards: player.whiteCards })
        );
        game.players = replenishWhiteCards(game, playerCards);
    } else {
        if (game.currentRound.blackCard) {
            game.players = dealWhiteCards(
                game,
                game.currentRound.blackCard.whiteCardsToPlay
            );
        }
    }

    game.stateMachine.skipRound();
    game.client.state = game.stateMachine.state;

    game.players = handleJoiningPlayers(io, game);
    game.players = setPlayersWaiting(game.players);

    const newGame = dealBlackCards(io, newCardCzar.sockets, game);

    const updatedGame = changeGameStateAfterTime(
        io,
        newGame,
        "startPlayingWhiteCards"
    );
    setGame(updatedGame);
    updatePlayersIndividually(io, updatedGame);
};

export const findGameAndPlayerBySocketID = async (socketID) => {
    if (process.env.USE_DB) {
        const game = await getDBGameBySocketId(socketID);
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

export const findGameByPlayerID = (playerID) => {
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
    return undefined;
};

export const shouldGameBeDeleted = (game) => {
    if (game.stateMachine.state === "lobby") {
        return game.players.every((player) =>
            ["disconnected", "spectating"].includes(player.state)
        );
    } else {
        return false;
    }
};

export const shouldReturnToLobby = (game) => {
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

export const shouldSkipRound = (game) => {
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

export const returnToLobby = (io, game) => {
    game.stateMachine.returnToLobby();
    game.client.state = game.stateMachine.state;

    const initialGame = resetGame(game);
    setGame(initialGame);

    updatePlayersIndividually(io, initialGame);
};

export const validateHostAndReturnToLobby = async (
    io,
    socket,
    gameID,
    playerID
) => {
    const game = await getGame(gameID);
    if (!game) return;

    if (!validateHost(game, playerID)) {
        sendNotification(
            ERROR_TYPES.forbiddenHostAction,
            NOTIFICATION_TYPES.error,
            { socket: socket }
        );
        return;
    }

    returnToLobby(io, game);
};

export const resetGame = (game) => {
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
    updatedGame.client.options.timers.duration = undefined;
    updatedGame.client.options.timers.passedTime = undefined;

    // Reset game state if not in lobby
    if (updatedGame.stateMachine.state !== "lobby") {
        updatedGame.stateMachine.returnToLobby();
    }

    return updatedGame;
};

export const updateTimers = (io, game) => {
    io.in(game.id).emit("update_timers", {
        timers: {
            duration: game.client.timers.duration,
            passedTime: getPassedTime(game.id),
        },
    });
};

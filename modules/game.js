import hri from "human-readable-ids";

import { gameOptions } from "../consts/gameSettings.js";
import { createStateMachine } from "./finiteStateMachine.js";
import {
    createNewPlayer,
    setPlayersActive,
    publicPlayersObject,
    setPlayersPlaying,
} from "./player.js";
import {
    validateHost,
    validateOptions,
    validateGameStartRequirements,
} from "./validate.js";
import { randomBetween } from "./util.js";
import { shuffleCards, dealWhiteCards } from "./card.js";

let games = [];

export const createGame = () => {
    const gameURL = hri.hri.random();
    const newGame = createNewGame(gameURL);
    games = [...games, newGame];
    return newGame;
};

export const getGame = (gameID) => {
    const game = games.filter((game) => game.id === gameID);
    return game.length > 0 ? game[0] : null;
};

export const setGame = (newGame) => {
    games = games.map((game) => {
        return game.id === newGame.id ? newGame : game;
    });
    return newGame;
};

export const joinGame = (gameID, playerSocketID) => {
    const game = getGame(gameID);
    if (!!game) {
        const isHost = game.players.length === 0;
        const player = createNewPlayer(playerSocketID, isHost);
        game.players.push(player);
        setGame(game);
        return player;
    }
    return null;
};

const createNewGame = (url) => {
    const fsm = createStateMachine();
    const game = {
        id: url,
        client: {
            id: url,
            state: fsm.state,
            options: {
                maximumPlayers: gameOptions.defaultPlayers,
                scoreLimit: gameOptions.defaultScoreLimit,
                winnerBecomesCardCzar: gameOptions.defaultWinnerBecomesCardCzar,
                allowKickedPlayerJoin: gameOptions.defaultAllowKickedPlayerJoin,
                cardPacks: [],
                selectWhiteCardTimeLimit: gameOptions.selectWhiteCardTimeLimit,
                selectBlackCardTimeLimit: gameOptions.selectBlackCardTimeLimit,
            },
            rounds: [],
        },
        players: [],
        cards: {
            whiteCards: [],
            blackCards: [],
            playedWhiteCards: [],
            playedBlackCards: [],
        },
        stateMachine: fsm,
        currentRound: {
            round: 0,
            blackCard: null,
            cardCzar: null,
            whiteCardsByPlayer: [],
        },
    };
    return game;
};

export const createRound = (roundNumber, blackCard, playerID) => {
    return {
        round: roundNumber,
        blackCard: blackCard,
        cardCzar: playerID,
        whiteCardsByPlayer: [],
    };
};

export const everyoneHasPlayedTurn = (game) => {
    const activePlayers = game.players.filter(
        (player) => player.state === "waiting" || player.isCardCzar
    );
    return (
        activePlayers.length ===
        game.client.rounds[game.client.rounds.length - 1].whiteCardsByPlayer
            .length
    );
};

export const changeGameStateAfterTime = (io, gameID, transition, time) => {
    setTimeout(() => {
        const game = getGame(gameID);
        if (!game) return;

        game.stateMachine[transition]();
        game.client.state = game.stateMachine.state;
        game.players = setPlayersActive(game.players);

        setGame(game);
        io.in(gameID).emit("update_game", { game: game.client });
        io.in(gameID).emit("update_players", {
            players: publicPlayersObject(game.players),
        });
    }, time * 1000);
};

export const joinToGame = (socket, io, gameID) => {
    console.log(`Join game id ${gameID}`);

    const game = getGame(gameID);
    if (game !== null) {
        socket.join(gameID);
        console.log(`Client joined room ${gameID}`);

        const player = joinGame(gameID, socket.id);

        io.in(gameID).emit("update_game", { game: game.client });
        socket.emit("update_player", { player: player });
    } else {
        socket.disconnect(true);
        console.log(`Client disconnected :( ${gameID}`);
    }
};

export const updateGameOptions = (io, gameID, playerID, newOptions) => {
    const game = getGame(gameID);

    if (!game) return;
    if (!validateHost(game, playerID)) return;

    game.client.options = validateOptions({
        ...game.client.options,
        ...newOptions,
    });
    const updatedGame = setGame(game);

    io.in(game.id).emit("update_game_options", {
        options: updatedGame.client.options,
    });
};

export const leaveFromGame = (io, gameID, playerID) => {
    const game = getGame(gameID);
    if (!!game && !!playerID) {
        game.players = game.players.map((player) => {
            return player.id === playerID
                ? { ...player, state: "disconnected" }
                : player;
        });
        setGame(game);
        io.in(gameID).emit("update_game", { game: game.client });
    }
};

export const startGame = (io, gameID, playerID) => {
    const game = getGame(gameID);
    if (!game) return undefined;

    if (!validateHost(game, playerID)) return undefined;

    const result = validateGameStartRequirements(game);
    if (!!result.error) return result.error;

    game.stateMachine.startGame();
    game.client.state = game.stateMachine.state;

    const playerCount = game.players.length;
    game.players[randomBetween(0, playerCount - 1)].isCardCzar = true;
    game.players = setPlayersPlaying(game.players);

    io.in(gameID).emit("update_players", {
        players: publicPlayersObject(game.players),
    });

    game.cards.whiteCards = shuffleCards([...game.cards.whiteCards]);
    game.cards.blackCards = shuffleCards([...game.cards.blackCards]);

    const gameWithStartingHands = dealWhiteCards(
        io,
        game,
        gameOptions.startingWhiteCardCount
    );
    setGame(gameWithStartingHands);

    io.in(gameID).emit("update_game", { game: gameWithStartingHands.client });
};

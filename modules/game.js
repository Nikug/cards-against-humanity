import hri from "human-readable-ids";
import { nanoid } from "nanoid";
import { gameOptions } from "../consts/gameSettings.js";

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

export const validateOptions = (newOptions) => {
    const validatedOptions = {
        ...newOptions,
        maximumPlayers: clamp(
            newOptions.maximumPlayers,
            gameOptions.minimunPlayers,
            gameOptions.maximumPlayers
        ),
        scoreLimit: clamp(
            newOptions.scoreLimit,
            gameOptions.minimumScoreLimit,
            gameOptions.maximumScoreLimit
        ),
        winnerBecomesCardCzar: !!newOptions.winnerBecomesCardCzar,
        allowKickedPlayerJoin: !!newOptions.allowKickedPlayerJoin,
    };
    return validatedOptions;
};

export const setPlayerName = (gameID, playerID, newName) => {
    const game = getGame(gameID);
    if (game) {
        game.players = game.players.map((player) => {
            return player.id === playerID
                ? { ...player, name: newName }
                : player;
        });
        setGame(game);
        return game.players;
    }
};

export const joinGame = (gameID, playerSocketID) => {
    const player = createNewPlayer(playerSocketID);
    const game = getGame(gameID);
    if (!!game) {
        game.players.push(player);
        setGame(game);
        return player;
    }
    return null;
};

const clamp = (value, min, max) => {
    return Math.max(Math.min(value, max), min);
};

const createNewGame = (url) => {
    const game = {
        id: url,
        url: url,
        players: [],
        cards: null,
        state: "lobby",
        options: {
            maximumPlayers: gameOptions.defaultPlayers,
            scoreLimit: gameOptions.defaultScoreLimit,
            winnerBecomesCardCzar: gameOptions.defaultWinnerBecomesCardCzar,
            cardURLs: [],
            allowKickedPlayerJoin: gameOptions.defaultAllowKickedPlayerJoin,
        },
        rounds: [],
    };
    return game;
};

const createNewPlayer = (socketID) => {
    const player = {
        id: nanoid(),
        socket: socketID,
        name: "",
        state: "pickingName",
        score: 0,
        isCardCzar: false,
        popularVoteScore: 0,
        whiteCards: [],
    };
    return player;
};

const addCardPack = (id) => {
    const url = `https://allbad.cards/api/pack/get?pack=${id}`;
    return;
};

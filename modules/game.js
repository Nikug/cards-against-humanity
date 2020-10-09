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

export const validateHost = (game, playerID) => {
    const hosts = game.players.filter(
        (player) => player.id === playerID && player.isHost
    );
    return hosts.length === 1;
};

const clamp = (value, min, max) => {
    return Math.max(Math.min(value, max), min);
};

const createNewGame = (url) => {
    const game = {
        id: url,
        url: url,
        players: [],
        cards: [],
        state: "lobby",
        options: {
            maximumPlayers: gameOptions.defaultPlayers,
            scoreLimit: gameOptions.defaultScoreLimit,
            winnerBecomesCardCzar: gameOptions.defaultWinnerBecomesCardCzar,
            allowKickedPlayerJoin: gameOptions.defaultAllowKickedPlayerJoin,
            cardPacks: [],
        },
        rounds: [],
    };
    return game;
};

const createNewPlayer = (socketID, isHost) => {
    const player = {
        id: nanoid(),
        socket: socketID,
        name: "",
        state: "pickingName",
        score: 0,
        isCardCzar: false,
        isHost: isHost,
        popularVoteScore: 0,
        whiteCards: [],
    };
    return player;
};

export const addCardPackToGame = (gameID, playerID, cardPack, whiteCards, blackCards) => {
    const game = getGame(gameID);
    if (!game) return undefined;

    if(!validateHost(game, playerID)) return undefined;

    const existingCardPack = game.options.cardPacks.filter(
        (existingCardPack) => existingCardPack.id === cardPack.id
    );
    if (existingCardPack.length > 0) return undefined;

    game.options.cardPacks = [...game.options.cardPacks, cardPack];
    game.cards.whiteCards = whiteCards;
    game.cards.blackCards = blackCards;
    setGame(game);

    return game.options;
};

export const removeCardPackFromGame = (gameID, cardPackID, playerID) => {
    const game = getGame(gameID);
    if (!game) return undefined;

    if(!validateHost(game, playerID)) return undefined;

    game.options.cardPacks = game.options.cardPacks.filter(
        (cardPack) => cardPack.id !== cardPackID
    );
    game.cards.whiteCards = game.cards.whiteCards.filter(
        (card) => card.cardPackID !== cardPackID
    );
    game.cards.blackCards = game.cards.blackCards.filter(
        (card) => card.cardPackID !== cardPackID
    );

    setGame(game);
    return game.options;
};

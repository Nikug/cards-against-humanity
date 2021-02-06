import hri from "human-readable-ids";

import { gameOptions } from "../consts/gameSettings.js";
import { createStateMachine } from "./finiteStateMachine.js";
import {
    createNewPlayer,
    setPlayersActive,
    publicPlayersObject,
    setPlayersPlaying,
    appointNextCardCzar,
    updatePlayersIndividually,
    getActivePlayers,
    resetPlayers,
    getJoiningPlayerState,
    handleJoiningPlayers,
} from "./player.js";
import {
    validateHost,
    validateOptions,
    validateGameStartRequirements,
    validateCardCzar,
    validateGameEnding,
} from "./validate.js";
import { randomBetween } from "./util.js";
import {
    shuffleCards,
    dealStartingWhiteCards,
    dealWhiteCards,
    dealBlackCards,
    replenishWhiteCards,
    anonymizedGameClient,
} from "./card.js";
import { setPopularVoteLeader } from "./popularVote.js";

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

export const removeGameIfNoActivePlayers = (gameID) => {
    const game = getGame(gameID);
    if (getActivePlayers(game.players).length === 0) {
        removeGame(gameID);
    }
};

export const removeGame = (gameID) => {
    games = games.filter((game) => game.id !== gameID);
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
                allowCardCzarPopularVote:
                    gameOptions.defaultAllowCardCzarPopularVote,
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
            cardIndex: 0,
            whiteCardsByPlayer: [],
        },
    };
    return game;
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

export const changeGameStateAfterTime = (io, gameID, transition, time) => {
    setTimeout(() => {
        const game = getGame(gameID);
        if (!game) return;

        game.stateMachine[transition]();
        game.client.state = game.stateMachine.state;
        game.players = setPlayersActive(game.players);

        setGame(game);
        updatePlayersIndividually(io, game);
    }, time * 1000);
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

    io.in(gameID).emit("update_game_options", {
        options: updatedGame.client.options,
    });
};

export const startGame = (io, gameID, playerID) => {
    const game = getGame(gameID);
    if (!game) return undefined;

    if (!validateHost(game, playerID)) return undefined;

    const result = validateGameStartRequirements(game);
    if (!!result.error) return result.error;

    game.stateMachine.startGame();
    game.client.state = game.stateMachine.state;

    const activePlayers = getActivePlayers(game.players);
    const cardCzarIndex = randomBetween(0, activePlayers.length - 1);
    game.players = game.players.map((player) =>
        player.id === activePlayers[cardCzarIndex].id
            ? { ...player, isCardCzar: true }
            : player
    );
    game.players = setPlayersPlaying(game.players);

    game.cards.whiteCards = shuffleCards([...game.cards.whiteCards]);
    game.cards.blackCards = shuffleCards([...game.cards.blackCards]);

    const gameWithStartingHands = dealStartingWhiteCards(
        io,
        game,
        gameOptions.startingWhiteCardCount
    );

    const newGame = dealBlackCards(
        io,
        activePlayers[cardCzarIndex].socket,
        gameWithStartingHands
    );

    setGame(newGame);

    updatePlayersIndividually(io, gameWithStartingHands);
};

export const startNewRound = (io, gameID, playerID) => {
    const game = getGame(gameID);
    if (!game) return undefined;

    if (!validateCardCzar(game, playerID)) return;

    if (validateGameEnding(game)) {
        endGame(io, game);
        return;
    }

    if (game.stateMachine.cannot("startRound")) return;

    game.stateMachine.startRound();
    game.client.state = game.stateMachine.state;

    game.players = dealWhiteCards(
        game,
        game.currentRound.blackCard.whiteCardsToPlay
    );

    game.players = handleJoiningPlayers(io, game);

    game.players = appointNextCardCzar(game, playerID);
    game.players = setPopularVoteLeader(game.players);

    const cardCzar = game.players.find((player) => player.isCardCzar);
    const newGame = dealBlackCards(io, cardCzar.socket, game);

    setGame(newGame);
    updatePlayersIndividually(io, newGame);
};

export const endGame = (io, game) => {
    if (game.stateMachine.can("endGame")) {
        game.stateMachine.endGame();
        game.client.state = game.stateMachine.state;
        setGame(game);
        updatePlayersIndividually(io, game);
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
        game.players = dealWhiteCards(
            game,
            game.currentRound.blackCard.whiteCardsToPlay
        );
    }

    game.stateMachine.skipRound();
    game.client.state = game.stateMachine.state;

    const newGame = dealBlackCards(io, newCardCzar.socket, game);
    setGame(newGame);
    updatePlayersIndividually(io, newGame);
};

export const findGameAndPlayerBySocketID = (socketID) => {
    for (let i = 0, gameCount = games.length; i < gameCount; i++) {
        for (
            let j = 0, playerCount = games[i].players.length;
            j < playerCount;
            j++
        ) {
            if (games[i].players[j].socket === socketID) {
                return {
                    game: { ...games[i] },
                    player: { ...games[i].players[j] },
                };
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

// TODO: remove once join_game works
// export const sendGameInfo = (io, playerID, socketID) => {
//     const game = findGameByPlayerID(playerID);

//     if (!game) {
//         io.to(socketID).emit("initial_data", {
//             game: undefined,
//             players: undefined,
//             player: undefined,
//         });
//     } else {
//         const player = game.players.find((player) => player.id === playerID);
//         player.socket = socketID;
//         game.players = game.players.map((oldPlayer) =>
//             oldPlayer.id === playerID ? player : oldPlayer
//         );
//         setGame(game);

//         io.to(socketID).emit("initial_data", {
//             game: { ...anonymizedGameClient(game) },
//             players: publicPlayersObject(game.players),
//             player: player,
//         });
//     }
// };

export const shouldGameBeDeleted = (game) => {
    if (game.stateMachine.state === "lobby") {
        return game.players.every((player) =>
            ["disconnected", "kicked"].includes(player.state)
        );
    } else {
        return false;
    }
};

export const shouldReturnToLobby = (game) => {
    if (game.stateMachine.state !== "lobby") {
        const activePlayers = getActivePlayers(game.players);
        if (activePlayers.length <= 1) {
            return true;
        }
        return game.players.every((player) =>
            ["disconnected", "kicked", "pickingName", "spectating"].includes(
                player.state
            )
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

export const validateHostAndReturnToLobby = (io, gameID, playerID) => {
    const game = getGame(gameID);
    if (!game) return;

    if (!validateHost(playerID)) return;

    returnToLobby(io, game);
};

export const resetGame = (game) => {
    // Reset rounds
    game.rounds = [];
    game.currentRound = undefined;

    // Reset playerStates, scores, cardczar status and player white cards
    game.players = resetPlayers(game.players);

    // Reset played cards back to deck
    game.cards.whiteCards = [
        ...game.cards.whiteCards,
        ...game.cards.playedWhiteCards,
    ];
    game.cards.blackCards = [
        ...game.cards.blackCards,
        ...game.cards.playedBlackCards,
    ];

    // Reset game state if not in lobby
    if (game.stateMachine.state !== "lobby") {
        game.stateMachine.returnToLobby();
    }

    return game;
};

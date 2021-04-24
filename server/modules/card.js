import { ERROR_TYPES, NOTIFICATION_TYPES } from "../consts/error.js";
import {
    addScore,
    emitToAllPlayerSockets,
    getPlayer,
    getPlayerByWhiteCards,
    setPlayersActive,
    setPlayersPlaying,
    updatePlayersIndividually,
} from "./player.js";
import {
    changeGameStateAfterTime,
    getPassedTime,
} from "./delayedStateChange.js";
import {
    createRound,
    everyoneHasPlayedTurn,
    getGame,
    setGame,
    updateTimers,
} from "./game.js";
import {
    validateCardCzar,
    validatePickingWinner,
    validatePlayerPlayingWhiteCards,
    validateShowingWhiteCard,
    validateState,
} from "./validate.js";

import { addStreak } from "./streak.js";
import { gameOptions } from "../consts/gameSettings.js";
import { randomBetween } from "./util.js";
import { sendNotification } from "./socket.js";

export const playWhiteCards = (io, socket, gameID, playerID, whiteCardIDs) => {
    let game = getGame(gameID);
    if (!game) return;

    const { error } = validatePlayerPlayingWhiteCards(
        game,
        playerID,
        whiteCardIDs
    );
    if (!!error) {
        sendNotification(error, NOTIFICATION_TYPES.error, { socket: socket });
        return;
    }

    const player = getPlayer(game, playerID);
    if (!player) return;

    const whiteCards = whiteCardIDs.map((id) =>
        player.whiteCards.find((whiteCard) => whiteCard.id === id)
    );

    player.whiteCards = player.whiteCards.filter(
        (whiteCard) => !whiteCardIDs.includes(whiteCard.id)
    );

    game.cards.playedWhiteCards = [
        ...game.cards.playedWhiteCards,
        ...whiteCards,
    ];

    player.state = "waiting";
    game.players = game.players.map((oldPlayer) =>
        oldPlayer.id === player.id ? player : oldPlayer
    );

    game.currentRound.whiteCardsByPlayer = [
        ...game.currentRound.whiteCardsByPlayer,
        createWhiteCardsByPlayer(whiteCards, playerID, player.name),
    ];

    if (everyoneHasPlayedTurn(game)) {
        startReading(io, game);
    } else {
        setGame(game);
        updatePlayersIndividually(io, game);
    }
};

export const startReading = (io, game) => {
    game.stateMachine.startReading();
    game.client.state = game.stateMachine.state;
    game.currentRound.whiteCardsByPlayer = shuffleCards([
        ...game.currentRound.whiteCardsByPlayer,
    ]);
    const updatedGame = changeGameStateAfterTime(io, game, "showCards");
    setGame(updatedGame);
    updatePlayersIndividually(io, updatedGame);
};

export const selectBlackCard = (
    io,
    socket,
    gameID,
    playerID,
    selectedCardID,
    discardedCardIDs
) => {
    const game = getGame(gameID);
    if (!game) return;

    if (!validateState(game, "pickingBlackCard")) {
        sendNotification(
            ERROR_TYPES.incorrectGameState,
            NOTIFICATION_TYPES.error,
            { socket: socket }
        );
        return;
    }
    if (!validateCardCzar(game, playerID)) {
        sendNotification(
            ERROR_TYPES.forbiddenCardCzarAction,
            NOTIFICATION_TYPES.error,
            { socket: socket }
        );
        return;
    }

    if (
        !game.cards.sentBlackCards.some(
            (blackCard) => blackCard.id === selectedCardID
        )
    )
        return;

    if (discardedCardIDs.length !== gameOptions.blackCardsToChooseFrom - 1)
        return;
    const discardedCards = game.cards.sentBlackCards.filter((blackCard) =>
        discardedCardIDs.includes(blackCard.id)
    );
    if (discardedCards.length !== discardedCardIDs.length) return;

    const selectedCard = game.cards.sentBlackCards.find(
        (blackCard) => blackCard.id === selectedCardID
    );
    game.cards.sentBlackCards = [];

    game.cards.playedBlackCards = [
        ...game.cards.playedBlackCards,
        selectedCard,
    ];
    if (!selectedCard) return;

    game.cards.blackCards = shuffleCardsBackToDeck(
        discardedCards,
        game.cards.blackCards
    );

    game.currentRound = createRound(
        game.client.rounds.length + 1,
        selectedCard,
        playerID
    );
    game.client.rounds = [...game.client.rounds, game.currentRound];

    game.stateMachine.startPlayingWhiteCards();
    game.client.state = game.stateMachine.state;
    game.players = setPlayersPlaying(game.players);

    const updatedGame = changeGameStateAfterTime(io, game, "startReading");
    setGame(updatedGame);
    updatePlayersIndividually(io, updatedGame);
};

export const sendBlackCards = (socket, gameID, playerID) => {
    const game = getGame(gameID);
    if (!game) return;

    if (!validateCardCzar(game, playerID)) {
        sendNotification(
            ERROR_TYPES.forbiddenCardCzarAction,
            NOTIFICATION_TYPES.error,
            { socket: socket }
        );
        return;
    }
    if (game.stateMachine.state !== "pickingBlackCard") {
        sendNotification(
            ERROR_TYPES.incorrectGameState,
            NOTIFICATION_TYPES.error,
            { socket: socket }
        );
        return;
    }

    socket.emit("deal_black_cards", {
        blackCards: game.cards.sentBlackCards,
    });
};

export const dealBlackCards = (io, socketIDs, game) => {
    const { blackCards, game: newGame } = drawBlackCards(
        game,
        gameOptions.blackCardsToChooseFrom
    );
    socketIDs.map((socket) => {
        io.to(socket).emit("deal_black_cards", {
            blackCards: blackCards,
        });
    });
    return newGame;
};

export const dealStartingWhiteCards = (io, game, count) => {
    const players = game.players.map((player) => {
        if (["active", "playing", "waiting"].includes(player.state)) {
            player.whiteCards = drawWhiteCards(game, count);
            emitToAllPlayerSockets(io, player, "update_player", {
                player: player,
            });
        }
        return player;
    });
    game.players = players;
    return game;
};

export const dealWhiteCards = (game, count) => {
    const playerIDs = game.currentRound.whiteCardsByPlayer.map(
        (player) => player.playerID
    );
    const updatedPlayers = game.players.map((player) => {
        if (playerIDs.includes(player.id)) {
            player.whiteCards = [
                ...player.whiteCards,
                ...drawWhiteCards(game, count),
            ];
        }
        return player;
    });
    return updatedPlayers;
};

export const replenishWhiteCards = (game, playersToUpdate) => {
    const idsToUpdate = playersToUpdate.map((player) => player.id);
    const updatedPlayers = game.players.map((player) => {
        const index = idsToUpdate.indexOf(player.id);
        if (index >= 0) {
            player.whiteCards = [
                ...player.whiteCards,
                ...drawWhiteCards(
                    game,
                    playersToUpdate[index].whiteCards.length
                ),
            ];
        }
        return player;
    });
    return updatedPlayers;
};

export const drawWhiteCards = (game, count) => {
    if (game.cards.whiteCards.length < count) {
        let cards = [...game.cards.whiteCards];
        if (game.cards.playedWhiteCards.length === 0) return [];

        game.cards.whiteCards = shuffleCards([...game.cards.playedWhiteCards]);
        game.cards.playedWhiteCards = [];

        cards = [
            ...cards,
            game.cards.whiteCards.splice(0, count - cards.length),
        ];
        setGame(game);
        return cards;
    } else {
        const drawnCards = game.cards.whiteCards.splice(0, count);
        setGame(game);
        return drawnCards;
    }
};

export const drawBlackCards = (game, count) => {
    if (game.cards.blackCards.length < count) {
        let blackCards = [...game.cards.blackCards];

        game.cards.blackCards = shuffleCards([...game.cards.playedBlackCards]);
        game.cards.playedBlackCards = [];

        blackCards = [
            ...blackCards,
            game.cards.blackCards.splice(0, count - blackCards.length),
        ];

        game.cards.sentBlackCards = [...blackCards];
        return { blackCards, game };
    } else {
        const blackCards = game.cards.blackCards.splice(0, count);
        game.cards.sentBlackCards = [...blackCards];
        return { blackCards, game };
    }
};

export const shuffleCardsBackToDeck = (cards, deck) => {
    let newCards = [...deck];
    for (const card in cards) {
        newCards.splice(randomBetween(0, newCards.length), 0, cards[card]);
    }
    return [...newCards];
};

export const createWhiteCardsByPlayer = (whiteCards, playerID, playerName) => {
    return {
        wonRound: false,
        playerID: playerID,
        playerName: playerName,
        popularVote: 0,
        popularVotes: [],
        whiteCards: whiteCards,
    };
};

export const shuffleCards = (cards) => {
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
};

export const showWhiteCard = (io, socket, gameID, playerID) => {
    const game = getGame(gameID);
    if (!game) return;

    const { error } = validateShowingWhiteCard(game, playerID);
    if (!!error) {
        if (socket !== null) {
            sendNotification(error, NOTIFICATION_TYPES.error, {
                socket: socket,
            });
        }
        return;
    }

    if (
        game.currentRound.cardIndex ===
        game.currentRound.whiteCardsByPlayer.length
    ) {
        game.stateMachine.showCards();
        game.client.state = game.stateMachine.state;
        const updatedGame = changeGameStateAfterTime(io, game, "endRound");
        setGame(updatedGame);

        updatePlayersIndividually(io, updatedGame);
    } else {
        const whiteCards =
            game.currentRound.whiteCardsByPlayer[game.currentRound.cardIndex]
                .whiteCards;
        game.currentRound.cardIndex = game.currentRound.cardIndex + 1;
        const updatedGame = changeGameStateAfterTime(io, game, "showCards");
        setGame(updatedGame);

        io.in(gameID).emit("show_white_card", {
            whiteCards: whiteCards,
            index: updatedGame.currentRound.cardIndex,
            outOf: updatedGame.currentRound.whiteCardsByPlayer.length,
        });
        updateTimers(io, updatedGame);
    }
};

export const anonymizePlayedWhiteCards = (playedWhiteCards, id) => {
    return playedWhiteCards.map((card) => {
        const { popularVotes, playerID, ...rest } = card;
        return {
            ...rest,
            playerName: card.wonRound ? card.playerName : null,
            isOwn: playerID === id,
        };
    });
};

export const anonymizeRounds = (rounds, playerID) => {
    return rounds.map((round) => {
        const { cardCzar, ...rest } = round;
        rest.whiteCardsByPlayer = anonymizePlayedWhiteCards(
            rest.whiteCardsByPlayer,
            playerID
        );
        return rest;
    });
};

export const anonymizedGameClient = (game) => {
    if (!game.client?.rounds || !game.currentRound) return { ...game.client };

    return {
        ...game.client,
        timers: {
            ...game.client.timers,
            passedTime: getPassedTime(game.timeout),
        },
        streak: game.streak
            ? { name: game.streak.name, wins: game.streak.wins }
            : undefined,
    };
};

export const selectWinner = (io, socket, gameID, playerID, whiteCardIDs) => {
    const game = getGame(gameID);
    if (!game) return;

    const { result, error } = validatePickingWinner(
        game,
        playerID,
        whiteCardIDs
    );
    if (!!error) {
        sendNotification(error, NOTIFICATION_TYPES.error, { socket: socket });
        return;
    }

    const winnerID = getPlayerByWhiteCards(game, whiteCardIDs);
    const winner = getPlayer(game, winnerID);
    game.streak = addStreak(game.streak, winner);
    if (!winnerID) return;
    game.players = addScore(game.players, winnerID, 1);

    const updatedCardsByPlayer = game.currentRound.whiteCardsByPlayer.map(
        (cardsByPlayer) =>
            cardsByPlayer.playerID === winnerID
                ? { ...cardsByPlayer, wonRound: true }
                : cardsByPlayer
    );
    game.currentRound = {
        ...game.currentRound,
        whiteCardsByPlayer: updatedCardsByPlayer,
    };

    const rounds = game.client.rounds.length;
    game.client.rounds[rounds - 1] = game.currentRound;

    game.stateMachine.endRound();
    game.client.state = game.stateMachine.state;

    game.players = setPlayersActive(game.players);

    const updatedGame = changeGameStateAfterTime(io, game, "startRound");
    setGame(updatedGame);
    updatePlayersIndividually(io, updatedGame);
};

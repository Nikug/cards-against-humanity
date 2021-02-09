import {
    getGame,
    setGame,
    everyoneHasPlayedTurn,
    createRound,
    changeGameStateAfterTime,
} from "./game.js";
import {
    validatePlayerPlayingWhiteCards,
    validateCardCzar,
    validateShowingWhiteCard,
    validatePickingWinner,
    validateState,
} from "./validate.js";
import {
    addScore,
    getPlayer,
    setPlayersActive,
    setPlayersPlaying,
    getPlayerByWhiteCards,
    updatePlayersIndividually,
    emitToAllPlayerSockets,
} from "./player.js";
import { gameOptions, playerName } from "../consts/gameSettings.js";
import { randomBetween } from "./util.js";

export const playWhiteCards = (io, gameID, playerID, whiteCardIDs) => {
    let game = getGame(gameID);
    if (!game) return;
    if (!validatePlayerPlayingWhiteCards(game, playerID, whiteCardIDs).result)
        return;

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
        game.stateMachine.startReading();
        game.client.state = game.stateMachine.state;
        game.currentRound.whiteCardsByPlayer = shuffleCards([
            ...game.currentRound.whiteCardsByPlayer,
        ]);
    }

    setGame(game);
    updatePlayersIndividually(io, game);
};

export const selectBlackCard = (
    io,
    gameID,
    playerID,
    selectedCardID,
    discardedCardIDs
) => {
    const game = getGame(gameID);
    if (!game) return;

    if (!validateState(game, "pickingBlackCard")) return;
    if (!validateCardCzar(game, playerID)) return;

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
    setGame(game);

    updatePlayersIndividually(io, game);
    // changeGameStateAfterTime(
    //     io,
    //     gameID,
    //     "startReading",
    //     game.client.options.selectWhiteCardTimeLimit +
    //         gameOptions.defaultGracePeriod
    // );
};

export const sendBlackCards = (socket, gameID, playerID) => {
    const game = getGame(gameID);
    if (!game) return;

    if (!validateCardCzar(game, playerID)) return;
    if (game.stateMachine.state !== "pickingBlackCard") return;

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

export const showWhiteCard = (io, gameID, playerID) => {
    const game = getGame(gameID);
    if (!game) return;

    const { result, error } = validateShowingWhiteCard(game, playerID);
    if (!result || error) {
        console.log(error);
        return;
    }

    if (
        game.currentRound.cardIndex ===
        game.currentRound.whiteCardsByPlayer.length
    ) {
        game.stateMachine.showCards();
        game.client.state = game.stateMachine.state;
        setGame(game);
        io.in(gameID).emit("update_game", {
            game: {
                ...anonymizedGameClient(game),
            },
        });
    } else {
        const whiteCards =
            game.currentRound.whiteCardsByPlayer[game.currentRound.cardIndex]
                .whiteCards;
        game.currentRound.cardIndex = game.currentRound.cardIndex + 1;
        setGame(game);

        io.in(gameID).emit("show_white_card", {
            whiteCards: whiteCards,
            index: game.currentRound.cardIndex,
            outOf: game.currentRound.whiteCardsByPlayer.length,
        });
    }
};

export const anonymizePlayedWhiteCards = (playedWhiteCards) => {
    return playedWhiteCards.map((card) => {
        const { popularVotes, playerID, ...rest } = card;
        return {
            ...rest,
            playerName: card.wonRound ? card.playerName : null,
        };
    });
};

export const anonymizeRounds = (rounds) => {
    return rounds.map((round) => {
        const { cardCzar, ...rest } = round;
        rest.whiteCardsByPlayer = anonymizePlayedWhiteCards(
            rest.whiteCardsByPlayer
        );
        return rest;
    });
};

export const anonymizedGameClient = (game) => {
    if (!game.client?.rounds || !game.currentRound) return { ...game.client };

    return {
        ...game.client,
        rounds: anonymizeRounds(game.client.rounds),
    };
};

export const selectWinner = (io, gameID, playerID, whiteCardIDs) => {
    const game = getGame(gameID);
    if (!game) return;
    const { result, error } = validatePickingWinner(
        game,
        playerID,
        whiteCardIDs
    );
    if (!!error || !result) return;

    const winnerID = getPlayerByWhiteCards(game, whiteCardIDs);
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

    setGame(game);
    updatePlayersIndividually(io, game);
};

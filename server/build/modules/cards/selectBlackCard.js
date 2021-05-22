"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectBlackCard = void 0;
const error_1 = require("../../consts/error");
const gameUtil_1 = require("../games/gameUtil");
const validate_1 = require("../utilities/validate");
const delayedStateChange_1 = require("../utilities/delayedStateChange");
const roundUtil_1 = require("../rounds/roundUtil");
const gameSettings_1 = require("../../consts/gameSettings");
const socket_1 = require("../utilities/socket");
const setPlayers_1 = require("../players/setPlayers");
const shuffleCards_1 = require("./shuffleCards");
const emitPlayers_1 = require("../players/emitPlayers");
const selectBlackCard = async (io, socket, gameID, playerID, selectedCardID, discardedCardIDs, client) => {
    const game = await gameUtil_1.getGame(gameID, client);
    if (!game)
        return;
    if (!validate_1.validateState(game, "pickingBlackCard")) {
        socket_1.sendNotification(error_1.ERROR_TYPES.incorrectGameState, error_1.NOTIFICATION_TYPES.error, { socket: socket });
        return;
    }
    if (!validate_1.validateCardCzar(game, playerID)) {
        socket_1.sendNotification(error_1.ERROR_TYPES.forbiddenCardCzarAction, error_1.NOTIFICATION_TYPES.error, { socket: socket });
        return;
    }
    if (!game.cards.sentBlackCards.some((blackCard) => blackCard.id === selectedCardID))
        return;
    if (discardedCardIDs.length !== gameSettings_1.gameOptions.blackCardsToChooseFrom - 1)
        return;
    const discardedCards = game.cards.sentBlackCards.filter((blackCard) => discardedCardIDs.includes(blackCard.id));
    if (discardedCards.length !== discardedCardIDs.length)
        return;
    const selectedCard = game.cards.sentBlackCards.find((blackCard) => blackCard.id === selectedCardID);
    if (!selectedCard)
        return;
    game.cards.sentBlackCards = [];
    game.cards.playedBlackCards = [
        ...game.cards.playedBlackCards,
        selectedCard,
    ];
    if (!selectedCard)
        return;
    game.cards.blackCards = shuffleCards_1.shuffleCardsBackToDeck(discardedCards, game.cards.blackCards);
    game.currentRound = roundUtil_1.createRound(game.client.rounds.length + 1, selectedCard, playerID);
    game.client.rounds = [...game.client.rounds, game.currentRound];
    game.stateMachine.startPlayingWhiteCards();
    game.client.state = game.stateMachine.state;
    game.players = setPlayers_1.setPlayersPlaying(game.players);
    const updatedGame = delayedStateChange_1.changeGameStateAfterTime(io, game, "startReading");
    await gameUtil_1.setGame(updatedGame, client);
    emitPlayers_1.updatePlayersIndividually(io, updatedGame);
};
exports.selectBlackCard = selectBlackCard;

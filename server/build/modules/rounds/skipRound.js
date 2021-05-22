"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restartRound = exports.shouldSkipRound = exports.skipRound = void 0;
const drawCards_1 = require("../cards/drawCards");
const playerUtil_1 = require("../players/playerUtil");
const cardCzar_1 = require("../players/cardCzar");
const delayedStateChange_1 = require("../utilities/delayedStateChange");
const gameSettings_1 = require("../../consts/gameSettings");
const gameUtil_1 = require("../games/gameUtil");
const setPlayers_1 = require("../players/setPlayers");
const shuffleCards_1 = require("../cards/shuffleCards");
const emitPlayers_1 = require("../players/emitPlayers");
const skipRound = async (io, game, newCardCzar, client) => {
    const newGame = drawCards_1.replenishWhiteCards(game);
    newGame.stateMachine.skipRound();
    newGame.client.state = newGame.stateMachine.state;
    newGame.players = setPlayers_1.setPlayersWaiting(newGame.players);
    const newerGame = drawCards_1.dealBlackCards(io, newCardCzar.sockets, newGame);
    const updatedGame = delayedStateChange_1.changeGameStateAfterTime(io, newerGame, "startPlayingWhiteCards");
    await gameUtil_1.setGame(updatedGame, client);
    emitPlayers_1.updatePlayersIndividually(io, updatedGame);
};
exports.skipRound = skipRound;
const shouldSkipRound = (game) => {
    if (game.stateMachine.state !== "lobby") {
        const activePlayerCount = playerUtil_1.getActivePlayers(game.players).length;
        const joiningPlayerCount = playerUtil_1.getPlayersWithState(game.players, "joining")
            .length;
        return (activePlayerCount < gameSettings_1.gameOptions.minimumPlayers &&
            activePlayerCount + joiningPlayerCount >= gameSettings_1.gameOptions.minimumPlayers);
    }
    else {
        return false;
    }
};
exports.shouldSkipRound = shouldSkipRound;
const restartRound = async (io, game, client) => {
    const cardCzar = playerUtil_1.getCardCzar(game.players);
    if (!cardCzar)
        return;
    game.cards.blackCards = shuffleCards_1.shuffleCardsBackToDeck([...game.cards.sentBlackCards], game.cards.blackCards);
    game.cards.sentBlackCards = [];
    game.players = cardCzar_1.appointNextCardCzar(game, cardCzar.id);
    const nextCardCzar = playerUtil_1.getCardCzar(game.players);
    await exports.skipRound(io, game, nextCardCzar, client);
};
exports.restartRound = restartRound;

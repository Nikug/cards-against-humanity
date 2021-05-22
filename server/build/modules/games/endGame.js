"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetGame = exports.endGame = void 0;
const delayedStateChange_1 = require("../utilities/delayedStateChange");
const resetPlayer_1 = require("../players/resetPlayer");
const gameUtil_1 = require("./gameUtil");
const emitPlayers_1 = require("../players/emitPlayers");
const endGame = async (io, game) => {
    if (game.stateMachine.can("endGame")) {
        game.stateMachine.endGame();
        game.client.state = game.stateMachine.state;
        const updatedGame = delayedStateChange_1.clearGameTimer(game);
        await gameUtil_1.setGame(updatedGame);
        emitPlayers_1.updatePlayersIndividually(io, updatedGame);
    }
};
exports.endGame = endGame;
const resetGame = (game) => {
    // Clear timeout
    const updatedGame = delayedStateChange_1.clearGameTimer(game);
    // Reset rounds
    updatedGame.client.rounds = [];
    updatedGame.currentRound = undefined;
    // Reset playerStates, scores, cardczar status and player white cards
    updatedGame.players = resetPlayer_1.resetPlayers(updatedGame.players);
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
exports.resetGame = resetGame;

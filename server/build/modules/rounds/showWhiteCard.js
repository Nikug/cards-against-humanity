"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showWhiteCard = void 0;
const gameUtil_1 = require("../games/gameUtil");
const error_1 = require("../../consts/error");
const delayedStateChange_1 = require("../utilities/delayedStateChange");
const socket_1 = require("../utilities/socket");
const emitPlayers_1 = require("../players/emitPlayers");
const timeout_1 = require("../utilities/timeout");
const validate_1 = require("../utilities/validate");
const showWhiteCard = async (io, socket, gameID, playerID, client) => {
    const game = await gameUtil_1.getGame(gameID, client);
    if (!game || !game.currentRound)
        return;
    const { error } = validate_1.validateShowingWhiteCard(game, playerID);
    if (!!error) {
        if (socket !== null) {
            socket_1.sendNotification(error, error_1.NOTIFICATION_TYPES.error, {
                socket: socket,
            });
        }
        return;
    }
    if (game.currentRound.cardIndex ===
        game.currentRound.whiteCardsByPlayer.length) {
        game.stateMachine.showCards();
        game.client.state = game.stateMachine.state;
        const rounds = game.client.rounds.length;
        game.client.rounds[rounds - 1] = game.currentRound;
        const updatedGame = delayedStateChange_1.changeGameStateAfterTime(io, game, "endRound");
        await gameUtil_1.setGame(updatedGame, client);
        emitPlayers_1.updatePlayersIndividually(io, updatedGame);
    }
    else {
        const whiteCards = game.currentRound.whiteCardsByPlayer[game.currentRound.cardIndex]
            .whiteCards;
        game.currentRound.cardIndex = game.currentRound.cardIndex + 1;
        const updatedGame = delayedStateChange_1.changeGameStateAfterTime(io, game, "showCards");
        await gameUtil_1.setGame(updatedGame, client);
        io.in(gameID).emit("show_white_card", {
            whiteCards: whiteCards,
            index: updatedGame.currentRound.cardIndex,
            outOf: updatedGame.currentRound.whiteCardsByPlayer.length,
        });
        timeout_1.updateTimers(io, updatedGame);
    }
};
exports.showWhiteCard = showWhiteCard;

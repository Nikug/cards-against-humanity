"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hostKick = void 0;
const error_1 = require("../../consts/error");
const socket_1 = require("../utilities/socket");
const playerUtil_1 = require("../players/playerUtil");
const gameOptions_1 = require("../games/gameOptions");
const gameUtil_1 = require("../games/gameUtil");
const disconnect_1 = require("./disconnect");
const validate_1 = require("../utilities/validate");
const hostKick = async (io, socket, gameID, playerID, targetID, removeFromGame, client) => {
    const game = await gameUtil_1.getGame(gameID, client);
    if (!game)
        return;
    if (!validate_1.validateHost(game, playerID)) {
        socket_1.sendNotification(error_1.ERROR_TYPES.forbiddenHostAction, error_1.NOTIFICATION_TYPES.error, { socket: socket });
        return;
    }
    const target = playerUtil_1.getPlayerByPublicID(game.players, targetID);
    if (!target)
        return;
    if (target.id === playerID)
        return; // Host can't kick themself
    if (removeFromGame || !gameOptions_1.checkSpectatorLimit(game)) {
        game.players = playerUtil_1.filterByPublicID(game.players, targetID);
        socket_1.sendNotification(error_1.ERROR_TYPES.kickedByHost, error_1.NOTIFICATION_TYPES.error, {
            sockets: target.sockets,
            io: io,
        });
        target.sockets.map((socket) => {
            socket_1.closeSocketWithID(io, socket);
        });
    }
    else {
        game.players = playerUtil_1.setPlayerState(game.players, target.id, "spectating");
        socket_1.sendNotification(error_1.ERROR_TYPES.movedToSpectators, error_1.NOTIFICATION_TYPES.error, {
            sockets: target.sockets,
            io: io,
        });
    }
    disconnect_1.handleSpecialCases(io, game, target, false, client);
};
exports.hostKick = hostKick;

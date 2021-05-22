"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSpectatorLimit = exports.checkPlayerLimit = exports.updateGameOptions = void 0;
const error_1 = require("../../consts/error");
const gameUtil_1 = require("./gameUtil");
const validate_1 = require("../utilities/validate");
const gameSettings_1 = require("../../consts/gameSettings");
const socket_1 = require("../utilities/socket");
const updateGameOptions = async (io, socket, gameID, playerID, newOptions, client) => {
    const game = await gameUtil_1.getGame(gameID, client);
    if (!game)
        return;
    if (!validate_1.validateHost(game, playerID)) {
        socket_1.sendNotification(error_1.ERROR_TYPES.forbiddenHostAction, error_1.NOTIFICATION_TYPES.error, { socket: socket });
        return;
    }
    game.client.options = validate_1.validateOptions({
        ...game.client.options,
        ...newOptions,
    });
    await gameUtil_1.setGame(game, client);
    io.in(gameID).emit("update_game_options", {
        options: game.client.options,
    });
};
exports.updateGameOptions = updateGameOptions;
const checkPlayerLimit = (game) => {
    const nonSpectators = game.players.filter((player) => player.state !== "spectating");
    return game.client.options.maximumPlayers > nonSpectators.length;
};
exports.checkPlayerLimit = checkPlayerLimit;
const checkSpectatorLimit = (game) => {
    const spectators = game.players.filter((player) => player.state === "spectating");
    return gameSettings_1.gameOptions.spectatorLimit > spectators.length;
};
exports.checkSpectatorLimit = checkSpectatorLimit;

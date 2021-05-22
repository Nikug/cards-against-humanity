"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.togglePlayerMode = void 0;
const error_1 = require("../../consts/error");
const gameOptions_1 = require("../games/gameOptions");
const playerUtil_1 = require("./playerUtil");
const gameUtil_1 = require("../games/gameUtil");
const disconnect_1 = require("../connections/disconnect");
const gameSettings_1 = require("../../consts/gameSettings");
const socket_1 = require("../utilities/socket");
const emitPlayers_1 = require("./emitPlayers");
const togglePlayerMode = async (io, socket, gameID, playerID, client) => {
    const game = await gameUtil_1.getGame(gameID, client);
    if (!game)
        return;
    const player = playerUtil_1.findPlayer(game.players, playerID);
    if (!player)
        return;
    if (player.state !== "spectating") {
        if (gameOptions_1.checkSpectatorLimit(game)) {
            game.players = playerUtil_1.setPlayerState(game.players, playerID, "spectating");
            await disconnect_1.handleSpecialCases(io, game, player, true, client);
            return;
        }
        else {
            socket_1.sendNotification(error_1.ERROR_TYPES.spectatorsAreFull, error_1.NOTIFICATION_TYPES.error, { socket: socket });
            return;
        }
    }
    else {
        if (gameOptions_1.checkPlayerLimit(game)) {
            if (player.name.length < gameSettings_1.playerName.minimumLength) {
                game.players = playerUtil_1.setPlayerState(game.players, playerID, "pickingName");
            }
            else {
                game.players = playerUtil_1.setPlayerState(game.players, playerID, game.stateMachine.state === "lobby" ? "active" : "joining");
            }
        }
        else {
            socket_1.sendNotification(error_1.ERROR_TYPES.playersAreFull, error_1.NOTIFICATION_TYPES.error, { socket: socket });
            return;
        }
    }
    await gameUtil_1.setGame(game, client);
    emitPlayers_1.updatePlayersIndividually(io, game);
};
exports.togglePlayerMode = togglePlayerMode;

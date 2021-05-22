"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateHostAndReturnToLobby = exports.returnToLobby = exports.shouldReturnToLobby = void 0;
const error_1 = require("../../consts/error");
const gameUtil_1 = require("../games/gameUtil");
const gameSettings_1 = require("../../consts/gameSettings");
const playerUtil_1 = require("../players/playerUtil");
const endGame_1 = require("../games/endGame");
const socket_1 = require("../utilities/socket");
const emitPlayers_1 = require("../players/emitPlayers");
const validate_1 = require("../utilities/validate");
const shouldReturnToLobby = (game) => {
    if (game.stateMachine.state !== "lobby") {
        const activePlayers = playerUtil_1.getActivePlayers(game.players);
        if (activePlayers.length < gameSettings_1.gameOptions.minimumPlayers) {
            return true;
        }
        return game.players.every((player) => ["disconnected", "pickingName", "spectating"].includes(player.state));
    }
    else {
        return false;
    }
};
exports.shouldReturnToLobby = shouldReturnToLobby;
const returnToLobby = async (io, game, client) => {
    game.stateMachine.returnToLobby();
    game.client.state = game.stateMachine.state;
    const initialGame = endGame_1.resetGame(game);
    await gameUtil_1.setGame(initialGame, client);
    emitPlayers_1.updatePlayersIndividually(io, initialGame);
};
exports.returnToLobby = returnToLobby;
const validateHostAndReturnToLobby = async (io, socket, gameID, playerID, client) => {
    const game = await gameUtil_1.getGame(gameID, client);
    if (!game)
        return;
    if (!validate_1.validateHost(game, playerID)) {
        socket_1.sendNotification(error_1.ERROR_TYPES.forbiddenHostAction, error_1.NOTIFICATION_TYPES.error, { socket: socket });
        return;
    }
    await exports.returnToLobby(io, game, client);
};
exports.validateHostAndReturnToLobby = validateHostAndReturnToLobby;

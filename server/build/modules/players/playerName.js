"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPlayerName = exports.updatePlayerName = void 0;
const gameUtil_1 = require("../games/gameUtil");
const playerUtil_1 = require("./playerUtil");
const gameSettings_1 = require("../../consts/gameSettings");
const sanitize_1 = require("../utilities/sanitize");
const emitPlayers_1 = require("./emitPlayers");
const updatePlayerName = async (io, gameID, playerID, newName, client) => {
    const game = await gameUtil_1.getGame(gameID, client);
    if (!game)
        return;
    const trimmedName = newName.trim();
    if (trimmedName.length < gameSettings_1.playerName.minimumLength)
        return;
    const cleanName = sanitize_1.sanitizeString(trimmedName, gameSettings_1.playerName.maximumLength);
    const player = playerUtil_1.findPlayer(game.players, playerID);
    if (!player)
        return;
    if (player.state === "pickingName") {
        player.state =
            game.stateMachine.state === "lobby" ? "active" : "joining";
    }
    const newGame = exports.setPlayerName(game, player, cleanName);
    if (!newGame)
        return;
    await gameUtil_1.setGame(newGame, client);
    emitPlayers_1.updatePlayersIndividually(io, newGame);
};
exports.updatePlayerName = updatePlayerName;
const setPlayerName = (game, newPlayer, newName) => {
    if (game) {
        game.players = game.players.map((player) => {
            return player.id === newPlayer.id
                ? { ...newPlayer, name: newName }
                : player;
        });
        return game;
    }
};
exports.setPlayerName = setPlayerName;

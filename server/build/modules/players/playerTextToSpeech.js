"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePlayerTextToSpeech = void 0;
const gameUtil_1 = require("../games/gameUtil");
const playerUtil_1 = require("./playerUtil");
const emitPlayers_1 = require("./emitPlayers");
const changePlayerTextToSpeech = async (io, gameID, playerID, useTTS, client) => {
    const game = await gameUtil_1.getGame(gameID, client);
    if (!game)
        return;
    const player = playerUtil_1.findPlayer(game.players, playerID);
    if (!player)
        return;
    player.useTextToSpeech = !!useTTS;
    game.players = game.players.map((gamePlayer) => gamePlayer.id === player.id ? player : gamePlayer);
    await gameUtil_1.setGame(game, client);
    emitPlayers_1.updatePlayersIndividually(io, game);
};
exports.changePlayerTextToSpeech = changePlayerTextToSpeech;

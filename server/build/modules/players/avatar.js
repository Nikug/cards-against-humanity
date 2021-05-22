"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultAvatar = exports.updateAvatar = void 0;
const gameUtil_1 = require("../games/gameUtil");
const playerUtil_1 = require("./playerUtil");
const updateAvatar = async (io, gameID, playerID, avatar, client) => {
    if (!validateAvatar(avatar))
        return;
    const game = await gameUtil_1.getGame(gameID, client);
    if (!game)
        return;
    game.players = setAvatar(game.players, playerID, avatar);
    await gameUtil_1.setGame(game, client);
    playerUtil_1.updatePlayers(io, game);
};
exports.updateAvatar = updateAvatar;
const defaultAvatar = () => {
    return {
        hatType: 0,
        eyeType: 0,
        mouthType: 0,
        skinType: 0,
    };
};
exports.defaultAvatar = defaultAvatar;
const setAvatar = (players, playerID, avatar) => {
    return players.map((player) => {
        if (player.id === playerID) {
            player.avatar = { ...player.avatar, ...avatar };
        }
        return player;
    });
};
const validateAvatar = (avatar) => {
    const values = Object.values(avatar);
    return values.every((value) => typeof value === "number");
};

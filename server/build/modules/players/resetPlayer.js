"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPlayers = void 0;
const gameSettings_1 = require("../../consts/gameSettings");
const resetPlayerState = (player) => {
    if (player.state === "disconnected" || player.state === "spectating")
        return player.state;
    return player.name.length > gameSettings_1.playerName.minimumLength
        ? "active"
        : "pickingName";
};
const resetPlayers = (players) => {
    return players.map((player) => ({
        ...player,
        score: 0,
        state: resetPlayerState(player),
        isCardCzar: false,
        popularVoteScore: 0,
        whiteCards: [],
    }));
};
exports.resetPlayers = resetPlayers;

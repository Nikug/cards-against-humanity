"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addScore = void 0;
const addScore = (players, playerID, scoreToAdd) => {
    return players.map((player) => player.id === playerID
        ? { ...player, score: player.score + scoreToAdd }
        : player);
};
exports.addScore = addScore;

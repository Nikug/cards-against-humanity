"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addStreak = void 0;
const addStreak = (streak, player) => {
    if (streak && streak.id === player.id) {
        streak.wins += 1;
        return streak;
    }
    else {
        return createStreak(player);
    }
};
exports.addStreak = addStreak;
const createStreak = (player) => {
    return {
        id: player.id,
        name: player.name,
        wins: 1,
    };
};

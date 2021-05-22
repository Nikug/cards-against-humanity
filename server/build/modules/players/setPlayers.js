"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPlayersWaiting = exports.setPlayersActive = exports.setPlayersPlaying = void 0;
const setPlayersPlaying = (players) => {
    return players.map((player) => {
        if (player.isCardCzar) {
            return { ...player, state: "waiting" };
        }
        else {
            return player.state === "active" || player.state === "waiting"
                ? { ...player, state: "playing" }
                : player;
        }
    });
};
exports.setPlayersPlaying = setPlayersPlaying;
const setPlayersActive = (players) => {
    return players.map((player) => player.state === "playing" || player.state === "waiting"
        ? { ...player, state: "active" }
        : player);
};
exports.setPlayersActive = setPlayersActive;
const setPlayersWaiting = (players) => {
    return players.map((player) => {
        if (player.isCardCzar) {
            return { ...player, state: "playing" };
        }
        else {
            return player.state === "active" || player.state === "playing"
                ? { ...player, state: "waiting" }
                : player;
        }
    });
};
exports.setPlayersWaiting = setPlayersWaiting;

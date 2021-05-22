"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointNextCardCzar = exports.getNextCardCzar = void 0;
const getNextCardCzar = (players, previousCardCzarID) => {
    const activePlayerIndexes = players
        .map((player, index) => ["active", "playing", "waiting", "joining"].includes(player.state)
        ? index
        : undefined)
        .filter((index) => index !== undefined);
    const cardCzarIndex = players.findIndex((player) => player.id === previousCardCzarID);
    const nextCardCzars = activePlayerIndexes.filter((index) => index && index > cardCzarIndex);
    if (nextCardCzars.length > 0) {
        return players[nextCardCzars[0]].id;
    }
    else {
        return players[activePlayerIndexes[0]].id;
    }
};
exports.getNextCardCzar = getNextCardCzar;
const appointNextCardCzar = (game, previousCardCzarID, winnerID) => {
    const nextCardCzarID = winnerID ?? exports.getNextCardCzar(game.players, previousCardCzarID);
    const players = game.players.map((player) => {
        if (player.id === previousCardCzarID) {
            return { ...player, isCardCzar: false };
        }
        else if (player.id === nextCardCzarID) {
            return { ...player, isCardCzar: true };
        }
        else {
            return player;
        }
    });
    return players;
};
exports.appointNextCardCzar = appointNextCardCzar;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldGameBeDeleted = exports.findGameByPlayerID = exports.findGameAndPlayerBySocketID = exports.removeGame = exports.removeGameIfNoActivePlayers = exports.setGame = exports.getGame = exports.getGameIds = exports.addGame = void 0;
const database_1 = require("../db/database");
const playerUtil_1 = require("../players/playerUtil");
let games = [];
const addGame = async (newGame, client) => {
    if (process.env.USE_DB && client) {
        await database_1.createDBGame(newGame, client);
    }
    else {
        games = [...games, newGame];
    }
};
exports.addGame = addGame;
const getGameIds = async (client) => {
    if (process.env.USE_DB) {
        const result = await database_1.getDBGameIds(client);
        const gameNames = result.rows.map((row) => row.gameid);
        return gameNames;
    }
    else {
        return games.map((game) => game.id);
    }
};
exports.getGameIds = getGameIds;
const getGame = async (gameID, client) => {
    if (process.env.USE_DB) {
        const game = await database_1.getDBGame(gameID, client);
        return game;
    }
    else {
        const game = games.find((game) => game.id === gameID);
        return game;
    }
};
exports.getGame = getGame;
const setGame = async (newGame, client) => {
    if (process.env.USE_DB && client) {
        await database_1.setDBGame(newGame, client);
    }
    else {
        games = games.map((game) => {
            return game.id === newGame.id ? newGame : game;
        });
    }
    return newGame;
};
exports.setGame = setGame;
const removeGameIfNoActivePlayers = async (gameID, client) => {
    const game = await exports.getGame(gameID, client);
    if (!game)
        return;
    if (!game.players ||
        playerUtil_1.getAllButDisconnectedPlayers(game.players).length === 0) {
        await exports.removeGame(gameID, client);
    }
};
exports.removeGameIfNoActivePlayers = removeGameIfNoActivePlayers;
const removeGame = async (gameID, client) => {
    if (process.env.USE_DB && client) {
        await database_1.deleteDBGame(gameID, client);
    }
    else {
        games = games.filter((game) => game.id !== gameID);
    }
};
exports.removeGame = removeGame;
const findGameAndPlayerBySocketID = async (socketID, client) => {
    if (process.env.USE_DB && client) {
        const game = await database_1.getDBGameBySocketId(socketID, client);
        if (!game)
            return undefined;
        const player = game.players.find((player) => player.sockets.includes(socketID));
        return { game, player };
    }
    else {
        for (let i = 0, gameCount = games.length; i < gameCount; i++) {
            for (let j = 0, playerCount = games[i].players.length; j < playerCount; j++) {
                if (games[i].players[j].sockets.includes(socketID)) {
                    return {
                        game: { ...games[i] },
                        player: { ...games[i].players[j] },
                    };
                }
            }
        }
    }
    return undefined;
};
exports.findGameAndPlayerBySocketID = findGameAndPlayerBySocketID;
const findGameByPlayerID = async (playerID, client) => {
    if (process.env.USE_DB && client) {
        const game = await database_1.getDBGameByPlayerId(playerID, client);
        return game;
    }
    else {
        for (let i = 0, gameCount = games.length; i < gameCount; i++) {
            for (let j = 0, playerCount = games[i].players.length; j < playerCount; j++) {
                if (games[i].players[j].id === playerID) {
                    return { ...games[i] };
                }
            }
        }
    }
    return undefined;
};
exports.findGameByPlayerID = findGameByPlayerID;
const shouldGameBeDeleted = (game) => {
    if (game.stateMachine.state === "lobby") {
        return game.players.every((player) => ["disconnected", "spectating"].includes(player.state));
    }
    else {
        return false;
    }
};
exports.shouldGameBeDeleted = shouldGameBeDeleted;

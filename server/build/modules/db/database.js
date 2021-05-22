"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDBGameIds = exports.getDBGameByPlayerId = exports.getDBGameBySocketId = exports.deleteDBGame = exports.createDBGame = exports.setDBGame = exports.getDBGame = exports.queryDB = exports.rollbackTransaction = exports.endTransaction = exports.startTransaction = void 0;
const transform_1 = require("./transform");
const pg_1 = __importDefault(require("pg"));
const { Pool } = pg_1.default;
const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: parseInt(process.env.PGPORT || "3211"),
});
const startTransaction = async () => {
    const client = await pool.connect();
    await client.query("BEGIN");
    return client;
};
exports.startTransaction = startTransaction;
const endTransaction = async (client) => {
    await client.query("COMMIT");
    client.release();
};
exports.endTransaction = endTransaction;
const rollbackTransaction = async (client) => {
    await client.query("ROLLBACK");
};
exports.rollbackTransaction = rollbackTransaction;
const queryDB = (query, params) => {
    return pool.query(query, params);
};
exports.queryDB = queryDB;
const getDBGame = async (gameID, client) => {
    const query = `SELECT game FROM games WHERE gameid = $1`;
    let result;
    if (!client) {
        result = await pool.query(query, [gameID]);
    }
    else {
        result = await client.query(query, [gameID]);
    }
    return transform_1.restoreFromDB(result);
};
exports.getDBGame = getDBGame;
const setDBGame = (game, client) => {
    const formattedGame = transform_1.formatToDB(game);
    client.query("UPDATE games SET game = $1 WHERE gameid = $2", [
        formattedGame,
        formattedGame.id,
    ]);
};
exports.setDBGame = setDBGame;
const createDBGame = (game, client) => {
    const formattedGame = transform_1.formatToDB(game);
    client.query("INSERT INTO games(gameid, game) VALUES ($1, $2)", [
        formattedGame.id,
        formattedGame,
    ]);
};
exports.createDBGame = createDBGame;
const deleteDBGame = (gameID, client) => {
    const query = `DELETE FROM games WHERE gameid = $1`;
    if (!client) {
        pool.query(query, [gameID]);
    }
    else {
        client.query(query, [gameID]);
    }
};
exports.deleteDBGame = deleteDBGame;
const getDBGameBySocketId = async (socketID, client) => {
    const result = await client.query(`SELECT game
        FROM games, jsonb_to_recordset(game -> 'players') as players(sockets varchar[])
        WHERE  $1 = ANY(players.sockets)`, [socketID]);
    return transform_1.restoreFromDB(result);
};
exports.getDBGameBySocketId = getDBGameBySocketId;
const getDBGameByPlayerId = async (playerID, client) => {
    const result = await client.query(`SELECT game
        FROM games, jsonb_to_recordset(game -> 'players') as players(id varchar)
        WHERE  $1 = players.id`, [playerID]);
    return transform_1.restoreFromDB(result);
};
exports.getDBGameByPlayerId = getDBGameByPlayerId;
const getDBGameIds = (client) => {
    return client.query("SELECT gameid FROM games");
};
exports.getDBGameIds = getDBGameIds;

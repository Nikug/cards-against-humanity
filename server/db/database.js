import { formatToDB, restoreFromDB } from "./transform.js";

import postgres from "pg";

const { Pool } = postgres;

const pool = new Pool();

export const queryDB = (query, params) => pool.query(query, params);

export const getDBGame = async (gameID) => {
    const result = await pool.query(
        "SELECT game FROM games WHERE gameid = $1",
        [gameID]
    );
    return restoreFromDB(result);
};

export const setDBGame = (game) => {
    const formattedGame = formatToDB(game);
    pool.query("UPDATE games SET game = $1 WHERE gameid = $2", [
        formattedGame,
        formattedGame.id,
    ]);
};

export const createDBGame = (game) => {
    const formattedGame = formatToDB(game);
    pool.query("INSERT INTO games(gameid, game) VALUES ($1, $2)", [
        formattedGame.id,
        formattedGame,
    ]);
};

export const deleteDBGame = (gameID) =>
    pool.query("DELETE FROM games WHERE gameid = $1", [gameID]);

export const getBySocketId = (socketID) =>
    pool.query(
        `SELECT game FROM games, jsonb_to_recordset(games.game.players) as items()`
    );

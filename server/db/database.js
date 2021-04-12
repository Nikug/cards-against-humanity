import postgres from "pg";

const { Pool } = postgres;

const pool = new Pool();

export const queryDB = (query, params) => pool.query(query, params);

export const getDBGame = (gameID) =>
    pool.query("SELECT game FROM games WHERE gameid = $1", [gameID]);

export const setDBGame = (game) =>
    pool.query("UPDATE games SET game = $1 WHERE gameid = $2", [game, game.id]);

export const createDBGame = (game) =>
    pool.query("INSERT INTO games(gameid, game) VALUES ($1, $2)", [
        game.id,
        game,
    ]);

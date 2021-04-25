import { formatToDB, restoreFromDB } from "./transform";
import postgres, { QueryResult } from "pg";

import type { Game } from "../types/types";

const { Pool } = postgres;

const pool = new Pool();

export const startTransaction = async () => {
    const client = await pool.connect();
    await client.query("BEGIN");
    return client;
};

export const endTransaction = async (client: postgres.PoolClient) => {
    await client.query("COMMIT");
    client.release();
};

export const rollbackTransaction = async (client: postgres.PoolClient) => {
    await client.query("ROLLBACK");
};

export const queryDB = (query: string, params?: string[]) =>
    pool.query(query, params);

export const getDBGame = async (
    gameID: string,
    client: postgres.PoolClient
) => {
    const query = `SELECT game FROM games WHERE gameid = $1`;
    let result: QueryResult;
    if (!client) {
        result = await pool.query(query, [gameID]);
    } else {
        result = await client.query(query, [gameID]);
    }

    return restoreFromDB(result);
};

export const setDBGame = (game: Game, client: postgres.PoolClient) => {
    const formattedGame = formatToDB(game);
    client.query("UPDATE games SET game = $1 WHERE gameid = $2", [
        formattedGame,
        formattedGame.id,
    ]);
};

export const createDBGame = (game: Game, client: postgres.PoolClient) => {
    const formattedGame = formatToDB(game);
    client.query("INSERT INTO games(gameid, game) VALUES ($1, $2)", [
        formattedGame.id,
        formattedGame,
    ]);
};

export const deleteDBGame = (gameID: string, client: postgres.PoolClient) => {
    const query = `DELETE FROM games WHERE gameid = $1`;
    if (!client) {
        pool.query(query, [gameID]);
    } else {
        client.query(query, [gameID]);
    }
};

export const getDBGameBySocketId = async (
    socketID: string,
    client: postgres.PoolClient
) => {
    const result = await client.query(
        `SELECT game
        FROM games, jsonb_to_recordset(game -> 'players') as players(sockets varchar[])
        WHERE  $1 = ANY(players.sockets)`,
        [socketID]
    );
    return restoreFromDB(result);
};

export const getDBGameByPlayerId = async (
    playerID: string,
    client: postgres.PoolClient
) => {
    const result = await client.query(
        `SELECT game
        FROM games, jsonb_to_recordset(game -> 'players') as players(id varchar)
        WHERE  $1 = players.id`,
        [playerID]
    );
    return restoreFromDB(result);
};

export const getDBGameIds = (client: postgres.PoolClient) => {
    return client.query("SELECT gameid FROM games");
};

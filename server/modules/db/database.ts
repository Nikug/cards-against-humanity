import { formatToDB, restoreFromDB } from "./transform";
import postgres, { QueryResult } from "pg";

import type { Game } from "../../types/types";
import { createTableQuery } from "./table";

const { Pool } = postgres;

const RETRY_DELAY = 5 * 1000;
const MAX_TRIES = 50;

const createNewPool = () => {
    return new Pool({
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DB,
        password: process.env.POSTGRES_PASSWORD,
        port: parseInt(process.env.POSTGRES_PORT || "5432"),
    });
};

let pool = createNewPool();

export const connectToDB = async () => {
    for (let i = 0; i < MAX_TRIES; i++) {
        try {
            console.log("Trying to connect to database...");
            if (process.env.PGPASSWORD === "") {
                console.log(
                    "No environment variables for database connection, shutting down..."
                );
                process.exit();
            }

            pool = createNewPool();
            await queryDB(createTableQuery);
            return;
        } catch (e) {
            console.error(e);
            console.log(
                `Couldn't connect to database. Trying again in ${
                    RETRY_DELAY / 1000
                } seconds (${i + 1}/${MAX_TRIES})`
            );
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        }
    }
    process.exit();
};

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

export const queryDB = (query: string, params?: string[]) => {
    return pool.query(query, params);
};

export const getDBGame = async (
    gameID: string,
    client?: postgres.PoolClient
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

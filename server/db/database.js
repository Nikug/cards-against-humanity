import postgres from "pg";

const { Pool } = postgres;

const pool = new Pool();

export const query = (query, params) => pool.query(query, params);

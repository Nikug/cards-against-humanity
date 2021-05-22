"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTableQuery = void 0;
exports.createTableQuery = `
    CREATE TABLE IF NOT EXISTS games (
        id serial NOT NULL PRIMARY KEY,
        gameid varchar,
        game jsonb NOT NULL
    )
`;

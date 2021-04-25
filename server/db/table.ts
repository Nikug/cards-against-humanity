export const createTableQuery = `
    CREATE TABLE IF NOT EXISTS games (
        id serial NOT NULL PRIMARY KEY,
        gameid varchar,
        game jsonb NOT NULL
    )
`;

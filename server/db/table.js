export const createTableQuery = `
    CREATE TABLE IF NOT EXISTS games (
        id serial NOT NULL PRIMARY KEY,
        game json NOT NULL
    )
`;

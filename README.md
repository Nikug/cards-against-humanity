# Caarrrdds

against humanity or something

## How to run

You need Node14 to run this project.

run `npm i` in root and in /client

run `npm run dev` in root. Then navigate your browser to `localhost:3000` for lobby and `localhost:3000/g/:id` for the game lobby.

## Database

The server can be run without a database with `npm run dev`. In this case, a list is used to store the games. To use a database, run the project with `npm run dev:db`. This requires that you have a PostgreSQL database somewhere where it can be accessed. Create `.env` file to the server folder and add the following environment variables to enable database connection:

- `PGHOST`
- `PGUSER`
- `PGDATABASE`
- `PGPASSWORD`
- `PGPORT`

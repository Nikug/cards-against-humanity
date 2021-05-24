import { createTableQuery } from "./table";
import postgres from "pg";
import { queryDB } from "./database";

const RETRY_DELAY = 5 * 1000;

export const connectToDB = async () => {
    for (;;) {
        try {
            console.log("Trying to connect to database...");
            if (process.env.PGPASSWORD === "") {
                console.log(
                    "No environment variables for database connection, shutting down..."
                );
                process.exit();
            }
            await queryDB(createTableQuery);
            return;
        } catch (e) {
            console.error(e);
            console.log(
                `Couldn't connect to database. Trying again in ${
                    RETRY_DELAY / 1000
                } seconds`
            );
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        }
    }
};

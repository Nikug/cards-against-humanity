import path, { dirname } from "path";

import { Server } from "socket.io";
import { createTableQuery } from "./db/table";
import express from "express";
import { fileURLToPath } from "url";
import http from "http";
import { queryDB } from "./db/database";
import { router } from "./routes/routes";
import { sockets } from "./routes/sockets";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

console.log(__filename, __dirname);

const port = process.env.PORT || 4000;
const PRODUCTION = process.env.PRODUCTION;
const USE_DB = process.env.USE_DB;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "/../client/build")));

app.use(router());
sockets(io);

if (USE_DB) {
    console.log("Using database!");
    queryDB(createTableQuery).catch((e: any) => {
        console.log("Couldn't connect to database. Shutting down...");
        console.error(e);
        process.exit();
    });
}

if (PRODUCTION) {
    console.log("Running production environment!");
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname + "/../client/build/index.html"));
    });
}

server.listen(port, () => {
    console.log(`Server started on port ${port}!`);
});

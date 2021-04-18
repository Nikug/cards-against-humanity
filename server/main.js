import path, { dirname } from "path";

import { createTableQuery } from "./db/table.js";
import express from "express";
import { fileURLToPath } from "url";
import http from "http";
import { queryDB } from "./db/database.js";
import { router } from "./routes/routes.js";
import socketIo from "socket.io";
import { sockets } from "./routes/sockets.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const port = process.env.PORT || 4000;
const PRODUCTION = process.env.PRODUCTION;
const USE_DB = process.env.USE_DB;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, "/../client/build")));

app.use(router());
sockets(io);

if (USE_DB) {
    console.log("Using database!");
    queryDB(createTableQuery);
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

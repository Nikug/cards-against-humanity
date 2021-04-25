import dotenv from "dotenv";
dotenv.config({ path: `${__dirname}/.env` });

import { Server } from "socket.io";
import { createTableQuery } from "./db/table";
import express from "express";
import http from "http";
import path from "path";
import { queryDB } from "./db/database";
import { router } from "./routes/routes";
import { sockets } from "./routes/sockets";

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
    console.log("Trying to connect to database...");
    queryDB(createTableQuery)
        .then(() => console.log("Connected to database!"))
        .catch((e: any) => {
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

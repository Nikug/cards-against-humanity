import dotenv from "dotenv";
dotenv.config({ path: `${__dirname}/.env` });

import { Server } from "socket.io";
import express from "express";
import http from "http";
import path from "path";
import { router } from "./modules/routes/routes";
import { sockets } from "./modules/routes/sockets";
import { connectToDB } from "./modules/db/connect";

const port = process.env.PORT || 4000;
const PRODUCTION = process.env.PRODUCTION;
const USE_DB = process.env.USE_DB;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "/../../client/build")));

app.use(router());
sockets(io);

if (USE_DB) {
    connectToDB()
}

if (PRODUCTION) {
    console.log("Running production environment!");
    app.get("/", (req, res) => {
        res.sendFile(path.join(__dirname + "/../../client/build/index.html"));
    });
}

server.listen(port, () => {
    console.log(`Server started on port ${port}!`);
});

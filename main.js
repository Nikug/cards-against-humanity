import express from "express";
import http from "http";
import socketIo from "socket.io";

import path, { dirname } from "path";
import { fileURLToPath } from 'url';

import { router } from"./routes/routes.js";
import { sockets } from "./routes/sockets.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const port = process.env.PORT || 4000;
const PRODUCTION = process.env.PRODUCTION;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, "client/build")));

app.use(router());
sockets(io);


if(PRODUCTION) {
    console.log("Running production environment!");
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname + "/client/build/index.html"));
    })
}

server.listen(port, () => {
    console.log(`Server started on port ${port}!`);
});
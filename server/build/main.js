"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: `${__dirname}/.env` });
const socket_io_1 = require("socket.io");
const table_1 = require("./modules/db/table");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const database_1 = require("./modules/db/database");
const routes_1 = require("./modules/routes/routes");
const sockets_1 = require("./modules/routes/sockets");
const port = process.env.PORT || 4000;
const PRODUCTION = process.env.PRODUCTION;
const USE_DB = process.env.USE_DB;
const app = express_1.default();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
app.use(express_1.default.static(path_1.default.join(__dirname, "/../../client/build")));
app.use(routes_1.router());
sockets_1.sockets(io);
if (USE_DB) {
    console.log("Trying to connect to database...");
    database_1.queryDB(table_1.createTableQuery)
        .then(() => console.log("Connected to database!"))
        .catch((e) => {
        console.log("Couldn't connect to database. Shutting down...");
        console.error(e);
        process.exit();
    });
}
if (PRODUCTION) {
    console.log("Running production environment!");
    app.get("/", (req, res) => {
        res.sendFile(path_1.default.join(__dirname + "/../../client/build/index.html"));
    });
}
server.listen(port, () => {
    console.log(`Server started on port ${port}!`);
});

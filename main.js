const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 4000;
const index = require("./routes/index");

const app = express();
app.use(index);

const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", (socket) => {
    console.log("New client connected!");

    socket.emit("FromAPI", "Hello from server!");
});

server.listen(port, () => {
    console.log(`Server started on port ${port}!`);
});
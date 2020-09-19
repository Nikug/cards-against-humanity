const express = require("express");
const http = require("http");
const path = require("path");

const port = process.env.PORT || 4000;
const PRODUCTION = false;

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);

io.on("connection", (socket) => {
    console.log("New client connected");
    socket.emit("FromAPI", "This is from server");
});

app.use(express.static(path.join(__dirname, "client/build")));

app.get("/", (req, res) => {
    res.send("This is server").status(200);
});

if(PRODUCTION) {
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname + "/client/build/index.html"));
    })
}

server.listen(port, () => {
    console.log(`Server started on port ${port}!`);
});
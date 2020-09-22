const express = require("express");
const Game = require("./game");
const router = express.Router();

module.exports = (io) => {
    router.get("/", (req, res) => {
        res.send("This is server").status(200);
    });
    
    router.post("/g", (req, res) => {
        const game = Game.createGame();
        res.send(game);
    });

    router.get("/g/:id", (req, res) => {
        const game = Game.getGame(req.params.id);
        if(game !== null) {
            // Add new player
            res.send(game);
        } else {
            res.send(`Game ${req.params.id} was not found :(`).status(404);
        }
    });

    io.on("connection", (socket) => {
        console.log(`Client joined! ID: ${socket.id}`);

        socket.on("join_game", (id) => {
            socket.join(id);
            console.log(`Client joined room ${id}`);
        });
    });

    io.on("disconnect", (socket) => {
        console.log(`Client left :( ID: ${socket.id}`)
    });
    return router;
};
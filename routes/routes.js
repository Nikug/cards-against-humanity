const express = require("express");
const Game = require("../game");
const router = express.Router();

module.exports = () => {
    router.get("/", (req, res) => {
        res.send("This is server").status(200);
    });
    
    router.post("/g", (req, res) => {
        const game = Game.createGame();
        res.send(game.url);
    });

    router.get("/g/:id", (req, res) => {
        const game = Game.getGame(req.params.id);
        if(game !== null) {
            res.send().status(200);
        } else {
            res.send(`Game ${req.params.id} was not found :(`).status(404);
        }
    });

    return router;
};
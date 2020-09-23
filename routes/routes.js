import express from "express";
const expressRouter = express.Router();
import { createGame, getGame } from "../modules/game.js";

export const router = () => {
    expressRouter.get("/", (req, res) => {
        res.send("This is server").status(200);
    });
    
    expressRouter.post("/g", (req, res) => {
        const game = createGame();
        res.send(game.url);
    });

    expressRouter.get("/g/:id", (req, res) => {
        const game = getGame(req.params.id);
        if(game !== null) {
            res.send().status(200);
        } else {
            res.send(`Game ${req.params.id} was not found :(`).status(404);
        }
    });

    return expressRouter;
};
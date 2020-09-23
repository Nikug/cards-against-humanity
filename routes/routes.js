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

    return expressRouter;
};
import { createGame } from "../modules/game.js";
import express from "express";

const expressRouter = express.Router();

export const router = () => {
    expressRouter.get("/", (req, res) => {
        res.send("This is server").status(200);
    });

    expressRouter.post("/g", (req, res) => {
        const game = createGame();
        res.send({ url: game.id });
    });

    return expressRouter;
};

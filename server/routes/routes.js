import express from "express";
const expressRouter = express.Router();
import { createGame } from "../modules/game.js";

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

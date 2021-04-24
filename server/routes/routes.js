import { ERROR_TYPES } from "../consts/error.js";
import { createGame } from "../modules/game.js";
import express from "express";
import { transactionize } from "../db/util.js";

const expressRouter = express.Router();

export const router = () => {
    expressRouter.get("/", (req, res) => {
        res.send("This is server").status(200);
    });

    expressRouter.post("/g", async (req, res) => {
        const game = await transactionize(createGame, []);
        if (!game) {
            res.send({ error: ERROR_TYPES.couldntCreateGame });
        } else {
            res.send({ url: game.id });
        }
    });

    return expressRouter;
};

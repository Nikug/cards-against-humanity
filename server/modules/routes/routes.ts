import { ERROR_TYPES } from "../../consts/error";
import { createGame } from "../games/createGame";
import express from "express";
import { transactionize } from "../db/util";

const expressRouter = express.Router();

export const router = () => {
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

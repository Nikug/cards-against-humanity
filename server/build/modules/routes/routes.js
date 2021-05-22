"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const error_1 = require("../../consts/error");
const createGame_1 = require("../games/createGame");
const express_1 = __importDefault(require("express"));
const util_1 = require("../db/util");
const expressRouter = express_1.default.Router();
const router = () => {
    expressRouter.post("/g", async (req, res) => {
        const game = await util_1.transactionize(createGame_1.createGame, []);
        if (!game) {
            res.send({ error: error_1.ERROR_TYPES.couldntCreateGame });
        }
        else {
            res.send({ url: game.id });
        }
    });
    return expressRouter;
};
exports.router = router;

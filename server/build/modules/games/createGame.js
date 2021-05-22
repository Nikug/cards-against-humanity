"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGame = void 0;
const gameSettings_1 = require("../../consts/gameSettings");
const gameUtil_1 = require("./gameUtil");
const human_readable_ids_1 = __importDefault(require("human-readable-ids"));
const newGame_1 = require("./newGame");
const util_1 = require("../db/util");
const createGame = async (client) => {
    const gameNames = await gameUtil_1.getGameIds(client);
    let gameURL = "";
    for (let i = 0, limit = gameSettings_1.GAME_NAME_GENERATOR_MAX_RUNS; i < limit; i++) {
        const newURL = human_readable_ids_1.default.hri.random();
        if (!gameNames.includes(newURL)) {
            gameURL = newURL;
            break;
        }
    }
    if (!gameURL)
        return undefined;
    const newGame = newGame_1.newGameTemplate(gameURL);
    setTimeout(() => util_1.transactionize(gameUtil_1.removeGameIfNoActivePlayers, [gameURL]), gameSettings_1.INACTIVE_GAME_DELETE_TIME);
    await gameUtil_1.addGame(newGame, client);
    return newGame;
};
exports.createGame = createGame;

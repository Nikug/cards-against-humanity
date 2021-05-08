import * as pg from "pg";

import {
    GAME_NAME_GENERATOR_MAX_RUNS,
    INACTIVE_GAME_DELETE_TIME,
} from "../../consts/gameSettings";
import { addGame, getGameIds, removeGameIfNoActivePlayers } from "./gameUtil";

import hri from "human-readable-ids";
import { newGameTemplate } from "./newGame";
import { transactionize } from "../db/util";

export const createGame = async (client: pg.PoolClient) => {
    const gameNames = await getGameIds(client);
    let gameURL = "";
    for (let i = 0, limit = GAME_NAME_GENERATOR_MAX_RUNS; i < limit; i++) {
        const newURL = hri.hri.random();
        if (!gameNames.includes(newURL)) {
            gameURL = newURL;
            break;
        }
    }

    if (!gameURL) return undefined;

    const newGame = newGameTemplate(gameURL);
    setTimeout(
        () => transactionize(removeGameIfNoActivePlayers, [gameURL]),
        INACTIVE_GAME_DELETE_TIME
    );
    await addGame(newGame, client);

    return newGame;
};

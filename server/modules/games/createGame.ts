import * as pg from "pg";

import { addGame, getGameIds } from "./gameUtil";

import { GAME_NAME_GENERATOR_MAX_RUNS } from "../../consts/gameSettings";
import hri from "human-readable-ids";
import { newGameTemplate } from "./newGame";

export const createGame = async (client: pg.PoolClient) => {
    const gameNames = await getGameIds(client);
    let gameURL = undefined;
    for (let i = 0, limit = GAME_NAME_GENERATOR_MAX_RUNS; i < limit; i++) {
        const newURL = hri.hri.random();
        if (!gameNames.includes(newURL)) {
            gameURL = newURL;
            break;
        }
    }

    if (!gameURL) return undefined;
    const newGame = newGameTemplate(gameURL);
    await addGame(newGame, client);

    return newGame;
};

import { Game } from "types";
import { createStateMachine } from "../modules/finiteStateMachine";
import type postgres from "pg";

export const formatToDB = (game: Game) => {
    const newGame = { ...game, stateMachine: game.stateMachine.state };
    return newGame;
};

export const restoreFromDB = (result: postgres.QueryResult) => {
    if (result.rows.length < 1) {
        return undefined;
    }

    const game = result.rows[0].game;

    const state = game.stateMachine;
    const fsm = createStateMachine(state);
    game.stateMachine = fsm;
    return game;
};

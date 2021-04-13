import { createStateMachine } from "../modules/finiteStateMachine.js";

export const formatToDB = (game) => {
    const newGame = { ...game, stateMachine: game.stateMachine.state };
    return newGame;
};

export const restoreFromDB = (result) => {
    if (result.rows.length < 1) {
        console.log("No rows!", result);
        return undefined;
    }

    const game = result.rows[0].game;

    const state = game.stateMachine;
    const fsm = createStateMachine(state);
    game.stateMachine = fsm;
    return game;
};

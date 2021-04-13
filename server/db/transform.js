import { createStateMachine } from "../modules/finiteStateMachine.js";

export const formatToDB = (game) => {
    const newGame = { ...game, stateMachine: game.stateMachine.state };
    return newGame;
};

export const restoreFromDB = (result) => {
    const game = result.rows[0].game;
    const state = game.stateMachine;
    const fsm = createStateMachine(state);
    game.stateMachine = fsm;
    console.log(
        "State:",
        state,
        "statemachine state:",
        game.stateMachine.state
    );
    return game;
};

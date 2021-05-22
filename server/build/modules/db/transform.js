"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreFromDB = exports.formatToDB = void 0;
const finiteStateMachine_1 = require("../utilities/finiteStateMachine");
const formatToDB = (game) => {
    const newGame = { ...game, stateMachine: game.stateMachine.state };
    return newGame;
};
exports.formatToDB = formatToDB;
const restoreFromDB = (result) => {
    if (result.rows.length < 1) {
        return undefined;
    }
    const game = result.rows[0].game;
    const state = game.stateMachine;
    const fsm = finiteStateMachine_1.createStateMachine(state);
    game.stateMachine = fsm;
    return game;
};
exports.restoreFromDB = restoreFromDB;

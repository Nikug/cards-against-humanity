"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStateMachine = void 0;
const javascript_state_machine_1 = __importDefault(require("javascript-state-machine"));
const createStateMachine = (initialState) => {
    // @ts-ignore
    const fsm = new javascript_state_machine_1.default({
        init: initialState ?? "lobby",
        transitions: [
            { name: "startGame", from: "lobby", to: "pickingBlackCard" },
            {
                name: "startPlayingWhiteCards",
                from: "pickingBlackCard",
                to: "playingWhiteCards",
            },
            {
                name: "startReading",
                from: "playingWhiteCards",
                to: "readingCards",
            },
            { name: "showCards", from: "readingCards", to: "showingCards" },
            { name: "endRound", from: "showingCards", to: "roundEnd" },
            { name: "startRound", from: "roundEnd", to: "pickingBlackCard" },
            { name: "endGame", from: "roundEnd", to: "gameOver" },
            { name: "returnToLobby", from: "*", to: "lobby" },
            { name: "skipRound", from: "*", to: "pickingBlackCard" },
        ],
    });
    return fsm;
};
exports.createStateMachine = createStateMachine;

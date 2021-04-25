import { StateMachine } from "javascript-state-machine";
import { GameState } from "types";

declare module "javascript-state-machine" {
    interface StateMachine {
        state: GameState;
    }
}

export as namespace StateMachine;

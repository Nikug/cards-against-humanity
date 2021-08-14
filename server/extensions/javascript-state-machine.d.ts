import "javascript-state-machine";
import { GameState } from "types";

declare module "javascript-state-machine" {
    interface StateMachine {
        state: GameState;

        can(string): boolean;
        cannot(string): boolean;

        startGame(): void;
        startPlayingWhiteCards(): void;
        startReading(): void;
        showCards(): void;
        endRound(): void;
        startRound(): void;
        endGame(): void;
        returnToLobby(): void;
        skipRound(): void;

        /**
         * Immediately jumps to game state. Only used in testing as a handy shortcut
         * @param {GameState} state Game state to jump to
         * @returns {void}
         */
        jumpTo(state: GameState): void;
    }
}

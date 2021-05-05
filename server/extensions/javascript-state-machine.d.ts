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
    }
}

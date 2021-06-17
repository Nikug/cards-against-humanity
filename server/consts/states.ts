import { PlayerState } from "types";

interface JoiningStates {
    [key: string]: PlayerState;
}

export const joiningPlayerStates: JoiningStates = {
    lobby: "pickingName",
    pickingBlackCard: "active",
    playingWhiteCards: "playing",
    readingCards: "active",
    roundEnd: "active",
    gameOver: "active",
};

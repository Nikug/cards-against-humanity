import * as delayedStateChange from "../modules/utilities/delayedStateChange";

import {
    createPlayer,
    ioMock,
    mockGameId,
    mockGetGame,
    mockPlayerId,
    mockSetGame,
} from "./helpers";

import { Game } from "types";
import { endGame } from "../modules/games/endGame";
import { newGameTemplate } from "../modules/games/newGame";

beforeAll(() => {
    jest.useFakeTimers();
});

afterAll(() => {
    jest.useRealTimers();
});

afterEach(() => {
    jest.clearAllMocks();
});

const mockClearTimer = () => jest.spyOn(delayedStateChange, "clearGameTimer");

describe("End Game", () => {
    it("can end the game from round end", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const host = createPlayer("host", true);
        const cardCzar = createPlayer("cardCzar", false, true);

        newGame.players = [host, cardCzar];
        newGame.stateMachine.jumpTo("roundEnd");

        const clearTimerMock = mockClearTimer();
        mockGetGame(newGame);
        await endGame(ioMock, newGame);

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("gameOver");
        expect(clearTimerMock).toHaveBeenCalledTimes(1);
    });

    it("cannot end game from some other state", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const host = createPlayer("host", true);
        const cardCzar = createPlayer("cardCzar", false, true);

        newGame.players = [host, cardCzar];
        newGame.stateMachine.jumpTo("readingCards");

        const clearTimerMock = mockClearTimer();
        mockGetGame(newGame);
        await endGame(ioMock, newGame);

        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(clearTimerMock).toHaveBeenCalledTimes(0);
    });
});

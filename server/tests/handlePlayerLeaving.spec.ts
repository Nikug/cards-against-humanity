import {
    createPlayer,
    ioMock,
    mockGameId,
    mockGetGame,
    mockSendNotification,
    mockSetGame,
    mockTransactionize,
    pgClientMock,
} from "./helpers";

import { ERROR_TYPES } from "../consts/error";
import { Game } from "types";
import { handlePlayerLeaving } from "../modules/connections/disconnect";
import { newGameTemplate } from "../modules/games/newGame";

jest.mock("../modules/cards/cardpack");

beforeAll(() => {
    jest.useFakeTimers();
});

afterAll(() => {
    jest.useRealTimers();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("Handle Player Leaving", () => {
    it("Returns to lobby if there are not enough players", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const leaver = createPlayer("leaver");
        const host = createPlayer("host", true, true);

        newGame.players = [host];
        newGame.stateMachine.jumpTo("readingCards");

        mockGetGame(newGame);
        const notificationMock = mockSendNotification();

        await handlePlayerLeaving(ioMock, newGame, leaver, false, pgClientMock);

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("lobby");
        expect(notificationMock).toHaveBeenCalledWith(
            ERROR_TYPES.notEnoughPlayers,
            expect.anything(),
            expect.anything()
        );
    });
});

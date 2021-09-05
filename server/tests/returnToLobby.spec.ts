import {
    createPlayer,
    ioMock,
    mockGameId,
    mockGetGame,
    mockSendNotification,
    mockSetGame,
    pgClientMock,
    socketMock,
} from "./helpers";

import { ERROR_TYPES } from "../consts/error";
import { Game } from "types";
import { newGameTemplate } from "../modules/games/newGame";
import { validateHostAndReturnToLobby } from "../modules/rounds/returnToLobby";

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

describe("Return To Lobby", () => {
    it("Allows host to return to lobby", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.jumpTo("pickingBlackCard");

        const host = createPlayer("host", true);
        const cardCzar = createPlayer("cardCzar", false, true);

        newGame.players = [host, cardCzar];

        mockGetGame(newGame);

        await validateHostAndReturnToLobby(
            ioMock,
            socketMock,
            mockGameId,
            "host",
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("lobby");
        expect(game.client.options.loadingCardPacks).toBe(true);
    });

    it("Allows host to return to in gameOver phase", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.jumpTo("gameOver");

        const host = createPlayer("host", true);
        const cardCzar = createPlayer("cardCzar", false, true);

        newGame.players = [host, cardCzar];

        mockGetGame(newGame);

        await validateHostAndReturnToLobby(
            ioMock,
            socketMock,
            mockGameId,
            "host",
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("lobby");
    });

    it("Doesn't allow non host to return to lobby", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.jumpTo("gameOver");

        const host = createPlayer("host", true);
        const cardCzar = createPlayer("cardCzar", false, true);

        newGame.players = [host, cardCzar];

        mockGetGame(newGame);
        const notificationMock = mockSendNotification();

        await validateHostAndReturnToLobby(
            ioMock,
            socketMock,
            mockGameId,
            "cardCzar",
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(notificationMock).toHaveBeenCalledWith(
            ERROR_TYPES.forbiddenHostAction,
            expect.anything(),
            expect.anything()
        );
    });
});

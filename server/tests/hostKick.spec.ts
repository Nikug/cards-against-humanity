import {
    createPlayer,
    ioMock,
    mockGameId,
    mockGetGame,
    mockPlayerId,
    mockSendNotification,
    mockSetGame,
    pgClientMock,
    socketMock,
} from "./helpers";

import { ERROR_TYPES } from "../consts/error";
import { Game } from "types";
import { hostKick } from "../modules/connections/kick";
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

describe("Host Kick", () => {
    it("Allows host to kick a player", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.jumpTo("lobby");

        const host = createPlayer("host", true);
        const cardCzar = createPlayer("cardCzar", false, true);
        const player = createPlayer(mockPlayerId, false, true);

        newGame.players = [host, cardCzar, player];

        mockGetGame(newGame);

        await hostKick(
            ioMock,
            socketMock,
            mockGameId,
            host.id,
            player.publicID,
            true,
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.players).toHaveLength(2);
        expect(game.players[0].id).toBe(host.id);
        expect(game.players[1].id).toBe(cardCzar.id);
    });

    it("Allows host to make player a spectator", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.jumpTo("readingCards");

        const host = createPlayer("host", true);
        const cardCzar = createPlayer("cardCzar", false, true);
        const player = createPlayer(mockPlayerId, false, true);

        newGame.players = [host, cardCzar, player];

        mockGetGame(newGame);

        await hostKick(
            ioMock,
            socketMock,
            mockGameId,
            host.id,
            player.publicID,
            false,
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.players).toHaveLength(3);
        expect(game.players[2].state).toBe("spectating");
    });

    it("Doesn't allow host to kick host", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.jumpTo("readingCards");

        const host = createPlayer("host", true);
        const cardCzar = createPlayer("cardCzar", false, true);
        const player = createPlayer(mockPlayerId, false, true);

        newGame.players = [host, cardCzar, player];

        mockGetGame(newGame);

        await hostKick(
            ioMock,
            socketMock,
            mockGameId,
            host.id,
            host.publicID,
            true,
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
    });

    it("Doesn't allow host to make host spectator", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.jumpTo("lobby");

        const host = createPlayer("host", true);
        const cardCzar = createPlayer("cardCzar", false, true);
        const player = createPlayer(mockPlayerId, false, true);

        newGame.players = [host, cardCzar, player];

        mockGetGame(newGame);

        await hostKick(
            ioMock,
            socketMock,
            mockGameId,
            host.id,
            host.publicID,
            false,
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
    });

    it("Doesn't allow non host to kick players", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.jumpTo("lobby");

        const host = createPlayer("host", true);
        const cardCzar = createPlayer("cardCzar", false, true);
        const player = createPlayer(mockPlayerId, false, true);

        newGame.players = [host, cardCzar, player];

        mockGetGame(newGame);
        const notificationMock = mockSendNotification();

        await hostKick(
            ioMock,
            socketMock,
            mockGameId,
            player.id,
            host.publicID,
            true,
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

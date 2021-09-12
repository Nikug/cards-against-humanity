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
import { gameOptions } from "../consts/gameSettings";
import { newGameTemplate } from "../modules/games/newGame";
import { togglePlayerMode } from "../modules/players/togglePlayerMode";

beforeAll(() => {
    jest.useFakeTimers();
});

afterAll(() => {
    jest.useRealTimers();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("Toggle Player Mode", () => {
    it("Allows player to become spectator", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.jumpTo("lobby");

        const host = createPlayer("host", true);
        const cardCzar = createPlayer("cardCzar", false, true);
        const player = createPlayer(mockPlayerId, false, true);

        newGame.players = [host, cardCzar, player];

        mockGetGame(newGame);

        await togglePlayerMode(
            ioMock,
            socketMock,
            mockGameId,
            mockPlayerId,
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.players).toHaveLength(3);
        expect(game.players[2].id).toBe(player.id);
        expect(game.players[2].state).toBe("spectating");
    });

    it("Allows spectator to become player in lobby", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.jumpTo("lobby");

        const host = createPlayer("host", true);
        const cardCzar = createPlayer("cardCzar", false, true);
        const player = createPlayer(mockPlayerId, false, true);
        player.state = "spectating";

        newGame.players = [host, cardCzar, player];

        mockGetGame(newGame);

        await togglePlayerMode(
            ioMock,
            socketMock,
            mockGameId,
            mockPlayerId,
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.players).toHaveLength(3);
        expect(game.players[2].id).toBe(player.id);
        expect(game.players[2].state).toBe("active");
    });

    it("Allows spectator to start joining as player during game", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.jumpTo("readingCards");

        const host = createPlayer("host", true);
        const cardCzar = createPlayer("cardCzar", false, true);
        const player = createPlayer(mockPlayerId, false, true);
        player.state = "spectating";

        newGame.players = [host, cardCzar, player];

        mockGetGame(newGame);

        await togglePlayerMode(
            ioMock,
            socketMock,
            mockGameId,
            mockPlayerId,
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.players).toHaveLength(3);
        expect(game.players[2].id).toBe(player.id);
        expect(game.players[2].state).toBe("joining");
    });

    it("Doesn't allow joining back if game is full", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.jumpTo("readingCards");

        const host = createPlayer("host", true);
        const cardCzar = createPlayer("cardCzar", false, true);
        const player = createPlayer(mockPlayerId, false, true);
        player.state = "spectating";

        newGame.players = [host, cardCzar, player];
        newGame.client.options.maximumPlayers = 2;

        mockGetGame(newGame);
        const notificationMock = mockSendNotification();

        await togglePlayerMode(
            ioMock,
            socketMock,
            mockGameId,
            mockPlayerId,
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(notificationMock).toHaveBeenCalledWith(
            ERROR_TYPES.playersAreFull,
            expect.anything(),
            expect.anything()
        );
    });

    it("Doesn't allow joining spectators if spectators are full", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.jumpTo("readingCards");

        const host = createPlayer("host", true);
        const cardCzar = createPlayer("cardCzar", false, true);
        const player = createPlayer(mockPlayerId, false, true);

        const spectators = Array(gameOptions.spectatorLimit)
            .fill(null)
            .map((_, i) => {
                const spectator = createPlayer(`spectator-${i}`);
                spectator.state = "spectating";
                return spectator;
            });
        newGame.players = [host, cardCzar, player, ...spectators];

        mockGetGame(newGame);
        const notificationMock = mockSendNotification();

        await togglePlayerMode(
            ioMock,
            socketMock,
            mockGameId,
            mockPlayerId,
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(notificationMock).toHaveBeenCalledWith(
            ERROR_TYPES.spectatorsAreFull,
            expect.anything(),
            expect.anything()
        );
    });
});

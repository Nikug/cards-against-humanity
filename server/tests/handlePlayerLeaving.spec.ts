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

    it("Doesn't return to lobby if there are still enough players", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const leaver = createPlayer("leaver");
        const cardCzar = createPlayer("cardCzar", false, true);
        const host = createPlayer("host", true);

        newGame.players = [host, cardCzar];
        newGame.stateMachine.jumpTo("showingCards");

        mockGetGame(newGame);

        await handlePlayerLeaving(ioMock, newGame, leaver, false, pgClientMock);

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("showingCards");
        expect(game.players).toHaveLength(2);
    });

    it("Skips round if there are enough joining players", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const leaver = createPlayer("leaver");
        const joiner = createPlayer("joiner");
        joiner.state = "joining";
        const host = createPlayer("host", true, true);

        newGame.players = [host, joiner];
        newGame.stateMachine.jumpTo("readingCards");

        mockGetGame(newGame);

        await handlePlayerLeaving(ioMock, newGame, leaver, false, pgClientMock);

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("pickingBlackCard");
        expect(game.players).toHaveLength(2);
        expect(game.players[1].isCardCzar).toBe(true);
    });

    it("Skips round if there are enough joining players and punishes card czar that left", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const leaver = createPlayer("leaver", false, true);
        leaver.state = "disconnected";
        const joiner = createPlayer("joiner");
        joiner.state = "joining";
        const host = createPlayer("host", true, true);

        newGame.players = [host, joiner, leaver];
        newGame.stateMachine.jumpTo("readingCards");

        mockGetGame(newGame);

        await handlePlayerLeaving(ioMock, newGame, leaver, true, pgClientMock);

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("pickingBlackCard");
        expect(game.players).toHaveLength(3);
        expect(game.players.find((player) => player.isCardCzar)).not.toBe(
            undefined
        );
        expect(game.players[2].score).toBe(-1);
    });

    it("Skips round if card czar left", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const leaver = createPlayer("leaver", false, true);
        leaver.state = "disconnected";
        const player = createPlayer("player");
        const host = createPlayer("host", true, true);

        newGame.players = [host, player, leaver];
        newGame.stateMachine.jumpTo("readingCards");

        mockGetGame(newGame);

        await handlePlayerLeaving(ioMock, newGame, leaver, false, pgClientMock);

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("pickingBlackCard");
        expect(game.players).toHaveLength(3);
        expect(game.players.find((player) => player.isCardCzar)).not.toBe(
            undefined
        );
        expect(game.players[2].score).toBe(0);
    });

    it("Skips round and punishes card czar", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const leaver = createPlayer("leaver", false, true);
        leaver.state = "disconnected";
        const player = createPlayer("player");
        const host = createPlayer("host", true, true);

        newGame.players = [host, player, leaver];
        newGame.stateMachine.jumpTo("readingCards");

        mockGetGame(newGame);

        await handlePlayerLeaving(ioMock, newGame, leaver, true, pgClientMock);

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("pickingBlackCard");
        expect(game.players).toHaveLength(3);
        expect(game.players.find((player) => player.isCardCzar)).not.toBe(
            undefined
        );
        expect(game.players[2].score).toBe(-1);
    });

    it("Goes to reading cards phase if last waited player leaves", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const leaver = createPlayer("leaver");
        leaver.state = "disconnected";
        const player = createPlayer("player");
        player.state = "waiting";
        const host = createPlayer("host", true, true);

        newGame.players = [host, player, leaver];
        newGame.stateMachine.jumpTo("playingWhiteCards");

        mockGetGame(newGame);

        await handlePlayerLeaving(ioMock, newGame, leaver, false, pgClientMock);

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("readingCards");
        expect(game.players).toHaveLength(3);
    });

    it("Doesn't go to reading cards phase if there are multiple waited players", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const leaver = createPlayer("leaver");
        leaver.state = "disconnected";
        const player = createPlayer("player");
        player.state = "waiting";
        const player2 = createPlayer("player2");
        const host = createPlayer("host", true, true);

        newGame.players = [host, player, player2, leaver];
        newGame.stateMachine.jumpTo("playingWhiteCards");

        mockGetGame(newGame);

        await handlePlayerLeaving(ioMock, newGame, leaver, false, pgClientMock);

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("playingWhiteCards");
        expect(game.players).toHaveLength(4);
    });
});

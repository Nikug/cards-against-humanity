import {
    createBlackCards,
    createPlayer,
    createWhiteCards,
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
import { Game } from "../types/types";
import { newGameTemplate } from "../modules/games/newGame";
import { startGame } from "../modules/games/startGame";

const CreateLobbyGame = (): Game => {
    const lobbyGame = newGameTemplate(mockGameId);
    lobbyGame.players = [
        createPlayer(mockPlayerId, true, false),
        createPlayer("other"),
    ];
    lobbyGame.cards.blackCards = createBlackCards(10);
    lobbyGame.cards.whiteCards = createWhiteCards(50);

    return lobbyGame;
};

beforeAll(() => {
    jest.useFakeTimers();
});

beforeEach(() => {
    jest.clearAllMocks();
});

describe("Start game", () => {
    it("should start game with 2 players and enough cards", async () => {
        const mockSet = mockSetGame();
        const mockGet = mockGetGame(CreateLobbyGame());
        await startGame(
            ioMock,
            socketMock,
            mockGameId,
            mockPlayerId,
            pgClientMock
        );
        expect(mockSet).toHaveBeenCalledTimes(1);
        const game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toEqual("pickingBlackCard");
    });

    it("should not start game with 1 player and enough cards", async () => {
        const lobbyGame = CreateLobbyGame();
        lobbyGame.players = [createPlayer(mockPlayerId, true, false)];

        const mockSet = mockSetGame();
        const mockGet = mockGetGame(lobbyGame);
        const mockNotification = mockSendNotification();
        await startGame(
            ioMock,
            socketMock,
            mockGameId,
            mockPlayerId,
            pgClientMock
        );
        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(mockNotification).toHaveBeenCalledTimes(1);
        expect(mockNotification).toHaveBeenCalledWith(
            ERROR_TYPES.notEnoughPlayers,
            expect.anything(),
            expect.anything()
        );
    });

    it("should not start game with 2 players and not enough white cards", async () => {
        const lobbyGame = CreateLobbyGame();
        lobbyGame.cards.whiteCards = createWhiteCards(5);

        const mockSet = mockSetGame();
        const mockGet = mockGetGame(lobbyGame);
        const mockNotification = mockSendNotification();
        await startGame(
            ioMock,
            socketMock,
            mockGameId,
            mockPlayerId,
            pgClientMock
        );
        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(mockNotification).toHaveBeenCalledTimes(1);
        expect(mockNotification).toHaveBeenCalledWith(
            ERROR_TYPES.notEnoughWhiteCards,
            expect.anything(),
            expect.anything()
        );
    });

    it("should not start game with 2 players and not enough black cards", async () => {
        const lobbyGame = CreateLobbyGame();
        lobbyGame.cards.blackCards = createBlackCards(1);

        const mockSet = mockSetGame();
        const mockGet = mockGetGame(lobbyGame);
        const mockNotification = mockSendNotification();
        await startGame(
            ioMock,
            socketMock,
            mockGameId,
            mockPlayerId,
            pgClientMock
        );
        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(mockNotification).toHaveBeenCalledTimes(1);
        expect(mockNotification).toHaveBeenCalledWith(
            ERROR_TYPES.notEnoughBlackCards,
            expect.anything(),
            expect.anything()
        );
    });

    it("should not start game if starter is not host", async () => {
        const lobbyGame = CreateLobbyGame();
        lobbyGame.players = [createPlayer(mockPlayerId), createPlayer("other")];

        const mockSet = mockSetGame();
        const mockGet = mockGetGame(lobbyGame);
        const mockNotification = mockSendNotification();
        await startGame(
            ioMock,
            socketMock,
            mockGameId,
            mockPlayerId,
            pgClientMock
        );
        expect(mockSet).toHaveBeenCalledTimes(0);
    });
});

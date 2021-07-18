import * as gameUtil from "../modules/games/gameUtil";

import { Game, Player } from "types";
import {
    createPlayer,
    ioMock,
    mockGameId,
    mockGetGame,
    mockPlayerId,
    mockSetGame,
    mockSocketId,
    mockTransactionize,
    pgClientMock,
} from "./helpers";

import { newGameTemplate } from "../modules/games/newGame";
import { setPlayerDisconnected } from "../modules/connections/disconnect";

const mockFindGameAndPlayerBySocket = (
    game: Game | undefined,
    player: Player | undefined
) => {
    return jest
        .spyOn(gameUtil, "findGameAndPlayerBySocketID")
        .mockImplementation(async () => ({ game: game, player: player }));
};

beforeEach(() => {
    jest.clearAllMocks();
});

describe("Disconnect", () => {
    it("allows player to disconnect from game", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        const playerToDisconnect = createPlayer("disconnect");
        playerToDisconnect.sockets = [mockSocketId];
        newGame.players = [
            createPlayer("host", true),
            createPlayer("random"),
            playerToDisconnect,
        ];
        mockGetGame(newGame);

        mockFindGameAndPlayerBySocket(newGame, playerToDisconnect);

        await setPlayerDisconnected(ioMock, mockSocketId, false);
        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.players[2].state).toBe("disconnected");
        expect(game.stateMachine.state).toBe("lobby");
    });

    it("allows player to leave from game", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        const playerToDisconnect = createPlayer("disconnect");
        playerToDisconnect.sockets = [mockSocketId];
        newGame.players = [
            createPlayer("host", true),
            createPlayer("random"),
            playerToDisconnect,
        ];
        mockGetGame(newGame);

        mockFindGameAndPlayerBySocket(newGame, playerToDisconnect);

        await setPlayerDisconnected(ioMock, mockSocketId, true);
        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.players.length).toBe(2);
        expect(game.players[2]).toBe(undefined);
        expect(game.stateMachine.state).toBe("lobby");
    });

    it("removes game after a delay if last player disconnects", async () => {
        jest.useFakeTimers();
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        const playerToDisconnect = createPlayer(mockPlayerId, true);
        playerToDisconnect.sockets = [mockSocketId];
        newGame.players = [playerToDisconnect];
        mockGetGame(newGame);

        mockTransactionize();
        mockFindGameAndPlayerBySocket(newGame, playerToDisconnect);
        const removeGameSpy = jest
            .spyOn(gameUtil, "removeGame")
            .mockImplementation(async () => undefined);

        await setPlayerDisconnected(ioMock, mockSocketId, false, pgClientMock);
        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.players.length).toBe(1);
        expect(game.players[0].state).toBe("disconnected");
        expect(game.stateMachine.state).toBe("lobby");

        jest.runAllTimers();
        await null;

        expect(removeGameSpy).toHaveBeenCalledTimes(1);
        expect(removeGameSpy).toHaveBeenCalledWith(mockGameId, pgClientMock);
        jest.useRealTimers();
    });

    it("removes game if last player leaves", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        const playerToDisconnect = createPlayer(mockPlayerId, true);
        playerToDisconnect.sockets = [mockSocketId];
        newGame.players = [playerToDisconnect];
        mockGetGame(newGame);

        mockFindGameAndPlayerBySocket(newGame, playerToDisconnect);
        const removeGameSpy = jest
            .spyOn(gameUtil, "removeGame")
            .mockImplementation(async () => undefined);

        await setPlayerDisconnected(ioMock, mockSocketId, true, pgClientMock);
        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(removeGameSpy).toHaveBeenCalledTimes(1);
        expect(removeGameSpy).toHaveBeenCalledWith(mockGameId, pgClientMock);
    });
});

import * as gameUtil from "../modules/games/gameUtil";

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
import { getGame } from "../modules/games/gameUtil";
import { joinGame } from "../modules/connections/join";
import { newGameTemplate } from "../modules/games/newGame";

beforeEach(() => {
    jest.clearAllMocks();
});

describe("Join game", () => {
    it("should allow join to empty game and make player host", async () => {
        const newGame = newGameTemplate(mockGameId);
        const mockSet = mockSetGame();
        const mockNotification = mockSendNotification();
        mockGetGame(newGame);
        await joinGame(
            ioMock,
            socketMock,
            mockGameId,
            undefined,
            undefined,
            pgClientMock
        );

        expect(mockNotification).toHaveBeenCalledTimes(0);
        expect(mockSet).toHaveBeenCalledTimes(1);

        const game: Game = await mockSet.mock.results[0].value;
        expect(game.players.length).toBe(1);
        expect(game.players[0].id).not.toBeNull();
        expect(game.players[0].isHost).toBe(true);
        expect(game.players[0].state).toBe("pickingName");
    });

    it("should allow player to join a game with player id", async () => {
        const newGame = newGameTemplate(mockGameId);
        const newPlayer = createPlayer(mockPlayerId);
        newPlayer.state = "disconnected";
        newGame.players = [newPlayer];
        const mockSet = mockSetGame();
        mockGetGame(newGame);

        jest.spyOn(gameUtil, "findGameByPlayerID").mockImplementation(
            async () => newGame
        );

        await joinGame(
            ioMock,
            socketMock,
            undefined,
            mockPlayerId,
            undefined,
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.players.length).toBe(1);
        expect(game.players[0].state).toBe("active");
    });

    it("should join player to the game where they disconnected, instead of the game with the given game id", async () => {
        const newGame = newGameTemplate(mockGameId);
        const newPlayer = createPlayer(mockPlayerId);
        newPlayer.state = "disconnected";
        newGame.players = [createPlayer("host", true), newPlayer];

        const mockSet = mockSetGame();
        const mockNotification = mockSendNotification();
        mockGetGame(newGame);

        jest.spyOn(gameUtil, "findGameByPlayerID").mockImplementation(
            async () => newGame
        );

        await joinGame(
            ioMock,
            socketMock,
            "some-random-id",
            mockPlayerId,
            undefined,
            pgClientMock
        );
        expect(mockSet).toHaveBeenCalledTimes(1);
        expect(mockNotification).toHaveBeenCalledWith(
            ERROR_TYPES.joinedToDifferentGame,
            expect.anything(),
            expect.anything()
        );
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.players.length).toBe(2);
        expect(game.players[1].state).toBe("active");
    });

    it("should not let player join to a game that doesn't exist", async () => {
        const mockSet = mockSetGame();
        mockGetGame(undefined);
        const mockNotification = mockSendNotification();

        await joinGame(
            ioMock,
            socketMock,
            mockGameId,
            undefined,
            undefined,
            pgClientMock
        );

        expect(mockSet).not.toHaveBeenCalled();
        expect(mockNotification).toHaveBeenCalledWith(
            ERROR_TYPES.gameWasNotFound,
            expect.anything(),
            expect.anything()
        );
    });

    it("should let player join with correct password", async () => {
        const newGame = newGameTemplate(mockGameId);
        newGame.client.options.password = "password";

        const mockSet = mockSetGame();
        mockGetGame(newGame);

        await joinGame(
            ioMock,
            socketMock,
            mockGameId,
            undefined,
            "password",
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.players.length).toBe(1);
        expect(game.players[0].state).toBe("pickingName");
    });

    it("should not let player join with incorrect password", async () => {
        const newGame = newGameTemplate(mockGameId);
        newGame.client.options.password = "password";

        const mockSet = mockSetGame();
        mockGetGame(newGame);

        await joinGame(
            ioMock,
            socketMock,
            mockGameId,
            undefined,
            "wrong password",
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(socketMock.emit).toHaveBeenCalledWith("join_game", {
            password: false,
        });
    });

    it("should join player as spectator if player limit is full", async () => {
        const newGame = newGameTemplate(mockGameId);
        newGame.players = [createPlayer("1", true), createPlayer("2")];
        newGame.client.options.maximumPlayers = 2;

        const mockSet = mockSetGame();
        mockGetGame(newGame);
        const mockNotification = mockSendNotification();

        await joinGame(
            ioMock,
            socketMock,
            mockGameId,
            undefined,
            undefined,
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        expect(mockNotification).toHaveBeenCalledWith(
            ERROR_TYPES.lobbyIsFullJoinAsSpectator,
            expect.anything(),
            expect.anything()
        );
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.players.length).toBe(3);
        expect(game.players[2].state).toBe("spectating");
    });

    it("should not let player join if players and spectators are full", async () => {
        const newGame = newGameTemplate(mockGameId);
        newGame.players = [
            createPlayer("a", true),
            createPlayer("b"),
            ...Array(gameOptions.spectatorLimit)
                .fill(0)
                .map((_, i) => {
                    const player = createPlayer(i.toString());
                    player.state = "spectating";
                    return player;
                }),
        ];
        newGame.client.options.maximumPlayers = 2;

        const mockSet = mockSetGame();
        mockGetGame(newGame);
        const mockNotification = mockSendNotification();

        await joinGame(
            ioMock,
            socketMock,
            mockGameId,
            undefined,
            undefined,
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(mockNotification).toHaveBeenCalledWith(
            ERROR_TYPES.lobbyAndSpectatorsAreFull,
            expect.anything(),
            expect.anything()
        );
    });
});

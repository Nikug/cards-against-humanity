import * as gameUtil from "../modules/games/gameUtil";
import * as database from "../modules/db/database";

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

beforeAll(() => jest.useFakeTimers());
afterAll(() => jest.useRealTimers());
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

        await setPlayerDisconnected(ioMock, mockSocketId, false, pgClientMock);
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

        await setPlayerDisconnected(ioMock, mockSocketId, true, pgClientMock);
        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.players.length).toBe(2);
        expect(game.players[2]).toBe(undefined);
        expect(game.stateMachine.state).toBe("lobby");
    });

    it("removes game after a delay if last player disconnects", async () => {
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

    it("selects new host if current host disconnects", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        const playerToDisconnect = createPlayer("disconnect", true);
        playerToDisconnect.sockets = [mockSocketId];
        newGame.players = [
            createPlayer("random 1"),
            createPlayer("random 2"),
            playerToDisconnect,
        ];
        mockGetGame(newGame);

        mockFindGameAndPlayerBySocket(newGame, playerToDisconnect);

        await setPlayerDisconnected(ioMock, mockSocketId, false, pgClientMock);
        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("lobby");
        expect(game.players[0].isHost).toBe(true);
        expect(game.players[2].state).toBe("disconnected");
        expect(game.players[2].isHost).toBe(false);
    });

    it("selects new host if current host leaves", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        const playerToDisconnect = createPlayer("disconnect", true);
        playerToDisconnect.sockets = [mockSocketId];
        newGame.players = [
            createPlayer("random 1"),
            createPlayer("random 2"),
            playerToDisconnect,
        ];
        mockGetGame(newGame);

        mockFindGameAndPlayerBySocket(newGame, playerToDisconnect);

        await setPlayerDisconnected(ioMock, mockSocketId, true, pgClientMock);
        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("lobby");
        expect(game.players[0].isHost).toBe(true);
        expect(game.players.length).toBe(2);
    });

    it("restarts round and selects new cardczar if current cardczar disconnects", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.startGame();
        newGame.stateMachine.startPlayingWhiteCards();
        newGame.client.state = "playingWhiteCards";
        const playerToDisconnect = createPlayer("disconnect", false, true);
        playerToDisconnect.sockets = [mockSocketId];
        newGame.players = [
            createPlayer("host", true),
            createPlayer("random 2"),
            playerToDisconnect,
        ];
        mockGetGame(newGame);

        mockFindGameAndPlayerBySocket(newGame, playerToDisconnect);

        await setPlayerDisconnected(ioMock, mockSocketId, false, pgClientMock);
        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("pickingBlackCard");
        expect(game.players[2].state).toBe("disconnected");
        expect(game.players[2].isCardCzar).toBe(false);
        expect(game.players[0].isCardCzar).toBe(true);
    });

    it("restarts round and selects new cardczar if current cardczar leaves", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.startGame();
        newGame.stateMachine.startPlayingWhiteCards();
        newGame.client.state = "playingWhiteCards";
        const playerToDisconnect = createPlayer("disconnect", false, true);
        playerToDisconnect.sockets = [mockSocketId];
        newGame.players = [
            createPlayer("host", true),
            createPlayer("random 2"),
            playerToDisconnect,
        ];
        mockGetGame(newGame);

        mockFindGameAndPlayerBySocket(newGame, playerToDisconnect);

        await setPlayerDisconnected(ioMock, mockSocketId, true, pgClientMock);
        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("pickingBlackCard");
        expect(game.players.length).toBe(2);
        expect(game.players[0].isCardCzar).toBe(true);
    });

    it("stops waiting for a player if they disconnect during white card selection", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.startGame();
        newGame.stateMachine.startPlayingWhiteCards();
        newGame.client.state = "playingWhiteCards";
        const playerToDisconnect = createPlayer("disconnect", false, false);
        playerToDisconnect.sockets = [mockSocketId];
        const playerDonePlaying = createPlayer("random 2");
        playerDonePlaying.state = "waiting";
        newGame.players = [
            createPlayer("host", true, true),
            playerDonePlaying,
            playerToDisconnect,
        ];
        mockGetGame(newGame);

        mockFindGameAndPlayerBySocket(newGame, playerToDisconnect);

        await setPlayerDisconnected(ioMock, mockSocketId, false, pgClientMock);
        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("readingCards");
        expect(game.players[2].state).toBe("disconnected");
    });

    it("stops waiting for a player if they leave during white card selection", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.startGame();
        newGame.stateMachine.startPlayingWhiteCards();
        newGame.client.state = "playingWhiteCards";
        const playerToDisconnect = createPlayer("disconnect", false, false);
        playerToDisconnect.sockets = [mockSocketId];
        const playerDonePlaying = createPlayer("random 2");
        playerDonePlaying.state = "waiting";
        newGame.players = [
            createPlayer("host", true, true),
            playerDonePlaying,
            playerToDisconnect,
        ];
        mockGetGame(newGame);

        mockFindGameAndPlayerBySocket(newGame, playerToDisconnect);

        await setPlayerDisconnected(ioMock, mockSocketId, true, pgClientMock);
        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("readingCards");
        expect(game.players.length).toBe(2);
    });

    it("returns to lobby if there are not enough players due to player disconnecting", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.startGame();
        newGame.stateMachine.startPlayingWhiteCards();
        newGame.client.state = "playingWhiteCards";
        const playerToDisconnect = createPlayer("disconnect", false, false);
        playerToDisconnect.sockets = [mockSocketId];
        newGame.players = [
            createPlayer("host", true, true),
            playerToDisconnect,
        ];
        mockGetGame(newGame);

        mockFindGameAndPlayerBySocket(newGame, playerToDisconnect);

        // Cardpack reloading when entering lobby uses startTransaction directly
        jest.spyOn(database, "startTransaction").mockImplementation(
            () => pgClientMock
        );

        await setPlayerDisconnected(ioMock, mockSocketId, false, pgClientMock);
        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("lobby");
        expect(game.players[1].state).toBe("disconnected");
    });

    it("returns to lobby if there are not enough players due to player leaving", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.startGame();
        newGame.stateMachine.startPlayingWhiteCards();
        newGame.client.state = "playingWhiteCards";
        const playerToDisconnect = createPlayer("disconnect", false, false);
        playerToDisconnect.sockets = [mockSocketId];
        newGame.players = [
            createPlayer("host", true, true),
            playerToDisconnect,
        ];
        mockGetGame(newGame);

        mockFindGameAndPlayerBySocket(newGame, playerToDisconnect);

        // Cardpack reloading when entering lobby uses startTransaction directly
        jest.spyOn(database, "startTransaction").mockImplementation(
            () => pgClientMock
        );

        await setPlayerDisconnected(ioMock, mockSocketId, true, pgClientMock);
        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("lobby");
        expect(game.players.length).toBe(1);
    });

    it("restarts round if cardczar disconnects and there are players joining when otherwise there are not enough players to start round", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.startGame();
        newGame.stateMachine.startPlayingWhiteCards();
        newGame.client.state = "playingWhiteCards";
        const playerToDisconnect = createPlayer("disconnect", false, true);
        playerToDisconnect.sockets = [mockSocketId];
        const joiningPlayer = createPlayer("random 2");
        joiningPlayer.state = "joining";
        newGame.players = [
            createPlayer("host", true, false),
            joiningPlayer,
            playerToDisconnect,
        ];
        mockGetGame(newGame);

        mockFindGameAndPlayerBySocket(newGame, playerToDisconnect);

        await setPlayerDisconnected(ioMock, mockSocketId, false, pgClientMock);
        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("pickingBlackCard");
        expect(game.players.length).toBe(3);
        expect(game.players[0].isCardCzar).toBe(true);
        expect(game.players[1].state).toBe("waiting");
    });

    it("restarts round if cardczar leaves and there are players joining when otherwise there are not enough players to start round", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.startGame();
        newGame.stateMachine.startPlayingWhiteCards();
        newGame.client.state = "playingWhiteCards";
        const playerToDisconnect = createPlayer("disconnect", false, true);
        playerToDisconnect.sockets = [mockSocketId];
        const joiningPlayer = createPlayer("random 2");
        joiningPlayer.state = "joining";
        newGame.players = [
            createPlayer("host", true, false),
            joiningPlayer,
            playerToDisconnect,
        ];
        mockGetGame(newGame);

        mockFindGameAndPlayerBySocket(newGame, playerToDisconnect);

        await setPlayerDisconnected(ioMock, mockSocketId, true, pgClientMock);
        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("pickingBlackCard");
        expect(game.players.length).toBe(2);
        expect(game.players[0].isCardCzar).toBe(true);
        expect(game.players[1].state).toBe("waiting");
    });
});
import {
    createPlayer,
    ioMock,
    mockGameId,
    mockGetGame,
    mockSetGame,
    pgClientMock,
} from "./helpers";

import { Game } from "types";
import { newGameTemplate } from "../modules/games/newGame";
import { playerName } from "../consts/gameSettings";
import { updatePlayerName } from "../modules/players/playerName";

beforeEach(() => {
    jest.clearAllMocks();
});

describe("Update Player Name", () => {
    it("Allows player to update their name in lobby", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.players = [createPlayer("host", true)];
        mockGetGame(newGame);

        await updatePlayerName(
            ioMock,
            mockGameId,
            "host",
            "newName",
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.players[0].name).toBe("newName");
    });

    it("Allows player to update their name in some other game state", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.jumpTo("playingWhiteCards");
        newGame.client.state = newGame.stateMachine.state;
        newGame.players = [createPlayer("host", true)];
        mockGetGame(newGame);

        await updatePlayerName(
            ioMock,
            mockGameId,
            "host",
            "newName",
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.players[0].name).toBe("newName");
    });

    it("Allows player to pick their name when joining to a game that is ongoing and updates their state from 'pickingName' to 'joining'", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.jumpTo("showingCards");
        newGame.client.state = newGame.stateMachine.state;

        const joiningPlayer = createPlayer("newPlayer");
        joiningPlayer.state = "pickingName";
        joiningPlayer.name = "";

        newGame.players = [createPlayer("host", true), joiningPlayer];
        mockGetGame(newGame);

        expect(newGame.players[1].state).toBe("pickingName");

        await updatePlayerName(
            ioMock,
            mockGameId,
            "newPlayer",
            "newName",
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.players[1].name).toBe("newName");
        expect(game.players[1].state).toBe("joining");
    });

    it("Allows emojis in name", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.players = [createPlayer("host", true)];
        mockGetGame(newGame);

        await updatePlayerName(
            ioMock,
            mockGameId,
            "host",
            "🤔👌",
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.players[0].name).toBe("🤔👌");
    });

    it("Shortens too long names", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.players = [createPlayer("host", true)];
        mockGetGame(newGame);

        await updatePlayerName(
            ioMock,
            mockGameId,
            "host",
            "a".repeat(playerName.maximumLength * 2),
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.players[0].name).toBe("a".repeat(playerName.maximumLength));
    });

    it("Doesn't allow too short names (empty names)", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.players = [createPlayer("host", true)];
        mockGetGame(newGame);

        await updatePlayerName(ioMock, mockGameId, "host", "", pgClientMock);

        expect(mockSet).toHaveBeenCalledTimes(0);
    });

    it("Doesn't allow name that is just whitespaces", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.players = [createPlayer("host", true)];
        mockGetGame(newGame);

        await updatePlayerName(
            ioMock,
            mockGameId,
            "host",
            "      ",
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
    });
});

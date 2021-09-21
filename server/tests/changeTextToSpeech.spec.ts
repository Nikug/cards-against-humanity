import {
    createPlayer,
    ioMock,
    mockGameId,
    mockGetGame,
    mockSetGame,
    pgClientMock,
} from "./helpers";

import { Game } from "types";
import { changePlayerTextToSpeech } from "../modules/players/playerTextToSpeech";
import { newGameTemplate } from "../modules/games/newGame";

beforeEach(() => {
    jest.clearAllMocks();
});

describe("Change text-to-speech", () => {
    it("Allows player to change their text-to-speech setting in lobby", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        const player = createPlayer("host", true);
        player.useTextToSpeech = false;
        newGame.players = [player];
        mockGetGame(newGame);

        await changePlayerTextToSpeech(
            ioMock,
            mockGameId,
            "host",
            true,
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.players[0].useTextToSpeech).toBe(true);
    });

    it("Allows player to change their text-to-speech setting when reading cards", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.jumpTo("readingCards");
        newGame.client.state = newGame.stateMachine.state;
        const player = createPlayer("host", true);
        player.useTextToSpeech = true;
        newGame.players = [player];
        mockGetGame(newGame);

        await changePlayerTextToSpeech(
            ioMock,
            mockGameId,
            "host",
            false,
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.players[0].useTextToSpeech).toBe(false);
    });

    it("Handles values that are not boolean by casting to boolean", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.jumpTo("readingCards");
        newGame.client.state = newGame.stateMachine.state;
        const player = createPlayer("host", true);
        player.useTextToSpeech = true;
        newGame.players = [player];
        mockGetGame(newGame);

        await changePlayerTextToSpeech(
            ioMock,
            mockGameId,
            "host",
            "maybe" as unknown as boolean,
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.players[0].useTextToSpeech).toBe(true);

        await changePlayerTextToSpeech(
            ioMock,
            mockGameId,
            "host",
            undefined as unknown as boolean,
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(2);
        const game2: Game = await mockSet.mock.results[1].value;
        expect(game2.players[0].useTextToSpeech).toBe(false);
    });
});

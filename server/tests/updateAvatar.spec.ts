import { Avatar, Game } from "types";
import {
    createPlayer,
    ioMock,
    mockGameId,
    mockGetGame,
    mockSetGame,
    pgClientMock,
} from "./helpers";

import { newGameTemplate } from "../modules/games/newGame";
import { updateAvatar } from "../modules/players/avatar";

beforeEach(() => {
    jest.clearAllMocks();
});

describe("Update Player Avatar", () => {
    it("Allows player to update their avatar in lobby", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.players = [createPlayer("host", true)];
        mockGetGame(newGame);

        const avatar: Avatar = {
            hatType: 1,
            eyeType: 3,
            mouthType: 0,
            skinType: 4,
        };

        await updateAvatar(ioMock, mockGameId, "host", avatar, pgClientMock);

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.players[0].avatar).toEqual(avatar);
    });

    it("Allows player to update their avatar in some other game state", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.jumpTo("showingCards");
        newGame.client.state = newGame.stateMachine.state;
        newGame.players = [createPlayer("host", true)];
        mockGetGame(newGame);

        const avatar: Avatar = {
            hatType: 1,
            eyeType: 3,
            mouthType: 0,
            skinType: 4,
        };

        await updateAvatar(ioMock, mockGameId, "host", avatar, pgClientMock);

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.players[0].avatar).toEqual(avatar);
    });

    // TODO: There are no avatars yet, so there are no limitations on the value
    // Check for value limits when the limits are known
});

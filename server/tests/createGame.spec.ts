import { mockId, mockTransactionize, pgClientMock } from "./helpers";

import { createGame } from "../modules/games/createGame";
import hri from "human-readable-ids";

jest.mock("human-readable-ids", () => ({
    hri: {
        random: () => mockId,
    },
}));

beforeAll(() => {
    jest.useFakeTimers();
    mockTransactionize();
});

describe("Create game", () => {
    it("should create game with id", async () => {
        const game = await createGame(pgClientMock);
        expect(game?.id).toEqual(mockId);
        expect(pgClientMock.query).toHaveBeenCalled();
    });

    it("should create game with correct state", async () => {
        const game = await createGame(pgClientMock);
        expect(game?.client.state).toEqual("lobby");
        expect(game?.stateMachine.state).toEqual("lobby");
    });

    it("should not create game if name is not available", async () => {
        pgClientMock.query = jest.fn(() => ({ rows: [{ gameid: mockId }] }));
        const game = await createGame(pgClientMock);
        expect(game).toEqual(undefined);
    });
});

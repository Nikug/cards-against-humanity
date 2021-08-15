import { ApiCardPack, Game } from "types";
import {
    createPlayer,
    ioMock,
    mockGameId,
    mockGetGame,
    mockSendNotification,
    mockSetGame,
    pgClientMock,
    socketMock,
} from "./helpers";
import fetch, { RequestInfo } from "node-fetch";

import { ERROR_TYPES } from "../consts/error";
import { addCardPack } from "../modules/cards/cardpack";
import { mocked } from "ts-jest/utils";
import { newGameTemplate } from "../modules/games/newGame";

const { Response } = jest.requireActual("node-fetch");

// Mock the allbard.cards API
jest.mock("node-fetch", () => {
    return jest.fn();
});
const mockPackId = "cardPackId123";
const mockData = {
    _id: "some mongo id",
    id: mockPackId,
    categories: ["General"],
    dateCreated: Date.now.toString(),
    dateUpdated: Date.now.toString(),
    definition: {
        white: Array.from(Array(20), (_, i) => i.toString()),
        black: Array.from(Array(10), (_, i) => ({
            pick: 1,
            draw: 1,
            content: i.toString(),
        })),
        family: false,
        pack: {
            name: "Testipakka",
            id: mockPackId,
        },
        quantity: {
            white: 20,
            black: 10,
            total: 30,
        },
        levelReq: "Free",
        packType: "Custom",
        retired: false,
    },
    favorites: -1,
    isNsfw: true,
    isPublic: true,
    owner: "some mongo id",
    packId: mockPackId,
    oldOwner: "some other type of id",
    buildVersion: 1,
};
const mockNotFound = { message: "Pack not found!" };

beforeEach(() => {
    jest.clearAllMocks();
});

describe("Add Card Pack", () => {
    it("Allows host to add a card pack in lobby", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.players = [createPlayer("host", true)];
        mockGetGame(newGame);

        mocked(fetch).mockReturnValue(
            Promise.resolve(new Response(JSON.stringify(mockData)))
        );

        await addCardPack(
            ioMock,
            socketMock,
            mockGameId,
            mockPackId,
            "host",
            pgClientMock
        );

        expect(mocked(fetch).mock.calls.length).toBe(1);
        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.client.options.cardPacks[0].id).toEqual(mockPackId);
        expect(game.client.options.cardPacks[0].isNsfw).toEqual(true);
        expect(game.cards.whiteCards).toHaveLength(20);
        expect(game.cards.blackCards).toHaveLength(10);
    });

    it("Sends error if card pack is not found", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.players = [createPlayer("host", true)];
        mockGetGame(newGame);

        mocked(fetch).mockReturnValue(
            Promise.resolve(
                new Response(JSON.stringify(mockNotFound), { status: 500 })
            )
        );
        const notificationMock = mockSendNotification();

        await addCardPack(
            ioMock,
            socketMock,
            mockGameId,
            "Some random id",
            "host",
            pgClientMock
        );

        expect(mocked(fetch).mock.calls.length).toBe(1);
        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(notificationMock).toHaveBeenCalledWith(
            ERROR_TYPES.cardPackWasNotFound,
            expect.anything(),
            expect.anything()
        );
    });

    // TODO: Send error if pack has already been added
    // Skip until fixed
    it.skip("Sends error if same pack has already been added", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.players = [createPlayer("host", true)];
        newGame.client.options.cardPacks = [
            {
                id: mockPackId,
                name: mockPackId,
                isNsfw: true,
                whiteCards: 20,
                blackCards: 10,
            },
        ];
        mockGetGame(newGame);

        mocked(fetch).mockReturnValue(
            Promise.resolve(new Response(JSON.stringify(mockData)))
        );
        const notificationMock = mockSendNotification();

        await addCardPack(
            ioMock,
            socketMock,
            mockGameId,
            mockPackId,
            "host",
            pgClientMock
        );

        expect(mocked(fetch).mock.calls.length).toBe(1);
        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(notificationMock).toHaveBeenCalledWith(
            ERROR_TYPES.cardPackWasNotFound,
            expect.anything(),
            expect.anything()
        );
    });

    // Skip until fixed
    it.skip("Doesn't allow adding a card pack if not in lobby", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.jumpTo("playingWhiteCards");
        newGame.players = [createPlayer("host", true)];
        mockGetGame(newGame);

        mocked(fetch).mockReturnValue(
            Promise.resolve(new Response(JSON.stringify(mockData)))
        );

        const mockNotification = mockSendNotification();

        await addCardPack(
            ioMock,
            socketMock,
            mockGameId,
            mockPackId,
            "host",
            pgClientMock
        );

        expect(mocked(fetch).mock.calls.length).toBe(1);
        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(mockNotification).toHaveBeenCalledWith(
            ERROR_TYPES.incorrectGameState,
            expect.anything(),
            expect.anything()
        );
    });

    // Skip until fixed
    it.skip("Doesn't allow adding a card pack if not host", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.players = [createPlayer("not-host", false)];
        mockGetGame(newGame);

        mocked(fetch).mockReturnValue(
            Promise.resolve(new Response(JSON.stringify(mockData)))
        );

        const mockNotification = mockSendNotification();

        await addCardPack(
            ioMock,
            socketMock,
            mockGameId,
            mockPackId,
            "not-host",
            pgClientMock
        );

        expect(mocked(fetch).mock.calls.length).toBe(1);
        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(mockNotification).toHaveBeenCalledWith(
            ERROR_TYPES.forbiddenHostAction,
            expect.anything(),
            expect.anything()
        );
    });
});

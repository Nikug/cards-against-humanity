import { CardPack, Game } from "types";
import {
    createBlackCards,
    createPlayer,
    createWhiteCards,
    ioMock,
    mockGameId,
    mockGetGame,
    mockSendNotification,
    mockSetGame,
    pgClientMock,
    socketMock,
} from "./helpers";

import { ERROR_TYPES } from "../consts/error";
import { newGameTemplate } from "../modules/games/newGame";
import { removeCardPack } from "../modules/cards/cardpack";

const mockPackId = "cardPack123";
const mockCardPack: CardPack = {
    id: mockPackId,
    name: "some pack",
    isNsfw: true,
    whiteCards: 20,
    blackCards: 20,
};

beforeEach(() => {
    jest.clearAllMocks();
});

describe("Remove Card Pack", () => {
    it("Allows host to remove the only card pack in lobby", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.players = [createPlayer("host", true)];
        newGame.client.options.cardPacks = [mockCardPack];
        newGame.cards.whiteCards = createWhiteCards(20, mockPackId);
        newGame.cards.blackCards = createBlackCards(20, mockPackId);

        mockGetGame(newGame);

        await removeCardPack(
            ioMock,
            socketMock,
            mockGameId,
            mockPackId,
            "host",
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.client.options.cardPacks).toHaveLength(0);
        expect(game.cards.whiteCards).toHaveLength(0);
        expect(game.cards.blackCards).toHaveLength(0);
    });

    it("Removes only cards from the pack that is removed", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.players = [createPlayer("host", true)];
        const anotherMockPackId = "notRemoved";

        const anotherMockPack = { ...mockCardPack, id: anotherMockPackId };
        newGame.client.options.cardPacks = [mockCardPack, anotherMockPack];
        newGame.cards.whiteCards = [
            ...createWhiteCards(20, mockPackId),
            ...createWhiteCards(20, anotherMockPackId),
        ];
        newGame.cards.blackCards = [
            ...createBlackCards(20, mockPackId),
            ...createBlackCards(20, anotherMockPackId),
        ];

        mockGetGame(newGame);

        await removeCardPack(
            ioMock,
            socketMock,
            mockGameId,
            mockPackId,
            "host",
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.client.options.cardPacks).toHaveLength(1);
        expect(game.client.options.cardPacks[0].id).toEqual(anotherMockPackId);
        expect(game.cards.whiteCards).toHaveLength(20);
        expect(game.cards.blackCards).toHaveLength(20);
        expect(
            game.cards.whiteCards.every(
                (card) => card.cardPackID === anotherMockPackId
            )
        ).toEqual(true);
        expect(
            game.cards.blackCards.every(
                (card) => card.cardPackID === anotherMockPackId
            )
        ).toEqual(true);
    });

    it("Doesn't allow removing a card pack if not in lobby", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.players = [createPlayer("host", true)];
        newGame.client.options.cardPacks = [mockCardPack];
        newGame.cards.whiteCards = createWhiteCards(20, mockPackId);
        newGame.cards.blackCards = createBlackCards(20, mockPackId);
        newGame.stateMachine.jumpTo("roundEnd");

        mockGetGame(newGame);
        const mockNotification = mockSendNotification();

        await removeCardPack(
            ioMock,
            socketMock,
            mockGameId,
            mockPackId,
            "host",
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(mockNotification).toHaveBeenCalledWith(
            ERROR_TYPES.incorrectGameState,
            expect.anything(),
            expect.anything()
        );
    });

    it("Doesn't allow not-host to remove a card pack", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.players = [
            createPlayer("host", true),
            createPlayer("not-host"),
        ];
        newGame.client.options.cardPacks = [mockCardPack];
        newGame.cards.whiteCards = createWhiteCards(20, mockPackId);
        newGame.cards.blackCards = createBlackCards(20, mockPackId);

        mockGetGame(newGame);
        const mockNotification = mockSendNotification();

        await removeCardPack(
            ioMock,
            socketMock,
            mockGameId,
            mockPackId,
            "not-host",
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(mockNotification).toHaveBeenCalledWith(
            ERROR_TYPES.forbiddenHostAction,
            expect.anything(),
            expect.anything()
        );
    });

    it("Doesn't remove anything if card pack is not found", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.players = [createPlayer("host", true)];
        newGame.client.options.cardPacks = [mockCardPack];
        newGame.cards.whiteCards = createWhiteCards(20, mockPackId);
        newGame.cards.blackCards = createBlackCards(20, mockPackId);

        mockGetGame(newGame);

        await removeCardPack(
            ioMock,
            socketMock,
            mockGameId,
            "some random pack id",
            "host",
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
    });
});

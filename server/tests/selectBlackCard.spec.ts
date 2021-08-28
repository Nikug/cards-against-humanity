import {
    createBlackCards,
    createPlayer,
    ioMock,
    mockGameId,
    mockGetGame,
    mockSendNotification,
    mockSetGame,
    pgClientMock,
    socketMock,
} from "./helpers";

import { ERROR_TYPES } from "../consts/error";
import { Game } from "types";
import { newGameTemplate } from "../modules/games/newGame";
import { selectBlackCard } from "../modules/cards/selectBlackCard";
import { sendBlackCards } from "../modules/cards/drawCards";

const mockPackId = "cardPack123";

afterEach(() => {
    jest.clearAllMocks();
});

beforeAll(() => {
    jest.useFakeTimers();
});

afterAll(() => {
    jest.useRealTimers();
});

describe("Select Black Card", () => {
    it("Allows card czar to select a black card from the sent cards", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.players = [
            createPlayer("host", true),
            createPlayer("cardCzar", false, true),
        ];
        const blackCards = createBlackCards(3, mockPackId);
        newGame.cards.sentBlackCards = blackCards;
        newGame.stateMachine.jumpTo("pickingBlackCard");

        mockGetGame(newGame);

        await selectBlackCard(
            ioMock,
            socketMock,
            mockGameId,
            "cardCzar",
            blackCards[1].id,
            [blackCards[0].id, blackCards[2].id],
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.cards.sentBlackCards).toHaveLength(0);
        expect(game.cards.blackCards).toContainEqual(blackCards[0]);
        expect(game.cards.blackCards).toContainEqual(blackCards[2]);
        expect(game.cards.blackCards).toHaveLength(2);
        expect(game.cards.playedBlackCards).toEqual([blackCards[1]]);
        expect(game.currentRound?.blackCard).toEqual(blackCards[1]);
        expect(game.stateMachine.state).toBe("playingWhiteCards");
    });

    it("Doesn't allow non card czar to select a black card from the sent cards", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.players = [
            createPlayer("host", true),
            createPlayer("notCardCzar", false, false),
        ];
        const blackCards = createBlackCards(3, mockPackId);
        newGame.cards.sentBlackCards = blackCards;
        newGame.stateMachine.jumpTo("pickingBlackCard");

        mockGetGame(newGame);
        const mockNotification = mockSendNotification();

        await selectBlackCard(
            ioMock,
            socketMock,
            mockGameId,
            "notCardCzar",
            blackCards[1].id,
            [blackCards[0].id, blackCards[2].id],
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(mockNotification).toHaveBeenCalledWith(
            ERROR_TYPES.forbiddenCardCzarAction,
            expect.anything(),
            expect.anything()
        );
    });

    it("Doesn't allow card czar to select a black card in incorrect game phase", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.players = [
            createPlayer("host", true),
            createPlayer("cardCzar", false, true),
        ];
        const blackCards = createBlackCards(3, mockPackId);
        newGame.cards.sentBlackCards = blackCards;
        newGame.stateMachine.jumpTo("readingCards");

        mockGetGame(newGame);
        const mockNotification = mockSendNotification();

        await selectBlackCard(
            ioMock,
            socketMock,
            mockGameId,
            "cardCzar",
            blackCards[1].id,
            [blackCards[0].id, blackCards[2].id],
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(mockNotification).toHaveBeenCalledWith(
            ERROR_TYPES.incorrectGameState,
            expect.anything(),
            expect.anything()
        );
    });

    it("Requires that all sent cards are returned", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.players = [
            createPlayer("host", true),
            createPlayer("cardCzar", false, true),
        ];
        const blackCards = createBlackCards(3, mockPackId);
        newGame.cards.sentBlackCards = blackCards;
        newGame.stateMachine.jumpTo("pickingBlackCard");

        mockGetGame(newGame);
        const mockNotification = mockSendNotification();

        await selectBlackCard(
            ioMock,
            socketMock,
            mockGameId,
            "cardCzar",
            blackCards[1].id,
            [blackCards[0].id],
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
    });
});

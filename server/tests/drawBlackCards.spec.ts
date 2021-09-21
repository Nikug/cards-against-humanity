import {
    createBlackCards,
    createPlayer,
    mockGameId,
    mockGetGame,
    mockSendNotification,
    pgClientMock,
    socketMock,
} from "./helpers";

import { ERROR_TYPES } from "../consts/error";
import { newGameTemplate } from "../modules/games/newGame";
import { sendBlackCards } from "../modules/cards/drawCards";

describe("Draw Black Cards", () => {
    it("Allows card czar to re-fetch black cards in pickingBlackCard phase", async () => {
        const newGame = newGameTemplate(mockGameId);
        newGame.players = [
            createPlayer("host", true),
            createPlayer("cardCzar", false, true),
        ];
        newGame.cards.sentBlackCards = createBlackCards(5);
        newGame.stateMachine.jumpTo("pickingBlackCard");

        mockGetGame(newGame);

        await sendBlackCards(socketMock, mockGameId, "cardCzar", pgClientMock);

        expect(socketMock.emit).toHaveBeenCalledWith(
            "deal_black_cards",
            expect.objectContaining({
                blackCards: newGame.cards.sentBlackCards,
            })
        );
    });

    it("Doesn't allow card czar to re-fetch black cards in some other game phase", async () => {
        const newGame = newGameTemplate(mockGameId);
        newGame.players = [
            createPlayer("host", true),
            createPlayer("cardCzar", false, true),
        ];
        newGame.cards.sentBlackCards = createBlackCards(5);
        newGame.stateMachine.jumpTo("readingCards");

        mockGetGame(newGame);
        const notificationMock = mockSendNotification();

        await sendBlackCards(socketMock, mockGameId, "cardCzar", pgClientMock);

        expect(notificationMock).toHaveBeenCalledWith(
            ERROR_TYPES.incorrectGameState,
            expect.anything(),
            expect.anything()
        );
    });

    it("Doesn't allow non card czar to re-fetch black cards", async () => {
        const newGame = newGameTemplate(mockGameId);
        newGame.players = [
            createPlayer("host", true),
            createPlayer("notCardCzar", false, false),
        ];
        newGame.cards.sentBlackCards = createBlackCards(5);
        newGame.stateMachine.jumpTo("pickingBlackCard");

        mockGetGame(newGame);
        const notificationMock = mockSendNotification();

        await sendBlackCards(
            socketMock,
            mockGameId,
            "notCardCzar",
            pgClientMock
        );

        expect(notificationMock).toHaveBeenCalledWith(
            ERROR_TYPES.forbiddenCardCzarAction,
            expect.anything(),
            expect.anything()
        );
    });
});

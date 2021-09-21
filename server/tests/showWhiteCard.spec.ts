import { BlackCard, Game, Player, WhiteCardsByPlayer } from "types";
import {
    createPlayer,
    createWhiteCards,
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
import { newGameTemplate } from "../modules/games/newGame";
import { showWhiteCard } from "../modules/rounds/showWhiteCard";

const createRound = (cardCzar: string, blackCard: BlackCard) => {
    const newRound = {
        round: 1,
        cardIndex: 0,
        cardCzar: cardCzar,
        blackCard: blackCard,
        whiteCardsByPlayer: [],
    };
    return newRound;
};

const createBlackCard = (whiteCards: number) => {
    const blackCard = {
        id: "1",
        cardPackID: "aa",
        text: "random text _",
        whiteCardsToPlay: whiteCards,
        whiteCardsToDraw: whiteCards,
    };
    return blackCard;
};

const createWhiteCardsByPlayer = (playerIds: string[], whiteCards: number) => {
    const cards: WhiteCardsByPlayer[] = playerIds.map((id) => ({
        playerID: id,
        playerName: id,
        popularVotes: [],
        wonRound: false,
        popularVote: 0,
        whiteCards: createWhiteCards(whiteCards),
    }));
    return cards;
};

const getPlayerIds = (players: Player[]) => players.map((player) => player.id);

afterEach(() => {
    jest.clearAllMocks();
});

beforeAll(() => {
    jest.useFakeTimers();
});

afterAll(() => {
    jest.useRealTimers();
});

describe("Show White Card", () => {
    it("Allows card czar to show first white card", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        newGame.players = [
            createPlayer("host", true),
            createPlayer("cardCzar", false, true),
            createPlayer("random"),
        ];
        newGame.stateMachine.jumpTo("readingCards");

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));
        newGame.currentRound.whiteCardsByPlayer = createWhiteCardsByPlayer(
            getPlayerIds(newGame.players),
            2
        );

        mockGetGame(newGame);

        await showWhiteCard(
            ioMock,
            socketMock,
            mockGameId,
            "cardCzar",
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.currentRound?.cardIndex).toBe(1);
        expect(game.stateMachine.state).toBe("readingCards");
    });

    it("Allows card czar to show second white card", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        newGame.players = [
            createPlayer("host", true),
            createPlayer("cardCzar", false, true),
            createPlayer("random"),
        ];
        newGame.stateMachine.jumpTo("readingCards");

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));
        newGame.currentRound.whiteCardsByPlayer = createWhiteCardsByPlayer(
            getPlayerIds(newGame.players),
            2
        );
        newGame.currentRound.cardIndex = 1;

        mockGetGame(newGame);

        await showWhiteCard(
            ioMock,
            socketMock,
            mockGameId,
            "cardCzar",
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.currentRound?.cardIndex).toBe(2);
        expect(game.stateMachine.state).toBe("readingCards");
    });

    it("Changes state after last card", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        newGame.players = [
            createPlayer("host", true),
            createPlayer("cardCzar", false, true),
            createPlayer("random"),
        ];
        newGame.stateMachine.jumpTo("readingCards");

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));
        newGame.currentRound.whiteCardsByPlayer = createWhiteCardsByPlayer(
            getPlayerIds(newGame.players),
            2
        );
        newGame.currentRound.cardIndex = 3;

        mockGetGame(newGame);

        await showWhiteCard(
            ioMock,
            socketMock,
            mockGameId,
            "cardCzar",
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.currentRound?.cardIndex).toBe(3);
        expect(game.stateMachine.state).toBe("showingCards");
    });

    it("Doesn't allow non card czar to show card", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        newGame.players = [
            createPlayer("host", true),
            createPlayer("cardCzar", false, true),
            createPlayer("random"),
        ];
        newGame.stateMachine.jumpTo("readingCards");

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));
        newGame.currentRound.whiteCardsByPlayer = createWhiteCardsByPlayer(
            getPlayerIds(newGame.players),
            2
        );
        newGame.currentRound.cardIndex = 3;

        mockGetGame(newGame);
        const mockNotification = mockSendNotification();

        await showWhiteCard(
            ioMock,
            socketMock,
            mockGameId,
            "random",
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(mockNotification).toHaveBeenCalledWith(
            ERROR_TYPES.forbiddenCardCzarAction,
            expect.anything(),
            expect.anything()
        );
    });
});

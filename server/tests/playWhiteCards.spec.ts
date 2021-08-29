import { BlackCard, Game } from "types";
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
import { playWhiteCards } from "../modules/cards/playWhiteCards";

const mockPackId = "cardPack123";

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

afterEach(() => {
    jest.clearAllMocks();
});

beforeAll(() => {
    jest.useFakeTimers();
});

afterAll(() => {
    jest.useRealTimers();
});

describe("Play White Cards", () => {
    it("Allow player to play white cards in correct game phase", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        const newPlayer = createPlayer(mockPlayerId, false, false);

        const mockWhiteCards = createWhiteCards(5, mockPackId);
        newPlayer.whiteCards = mockWhiteCards;
        newPlayer.state = "playing";
        newGame.players = [
            createPlayer("host", true),
            createPlayer("cardCzar", false, true),
            newPlayer,
        ];
        newGame.stateMachine.jumpTo("playingWhiteCards");

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));

        mockGetGame(newGame);

        await playWhiteCards(
            ioMock,
            socketMock,
            mockGameId,
            mockPlayerId,
            [mockWhiteCards[0].id, mockWhiteCards[2].id],
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("playingWhiteCards");
        expect(
            game.players.find((player) => player.id === mockPlayerId)?.state
        ).toBe("waiting");
        expect(game.currentRound?.whiteCardsByPlayer[0].playerID).toBe(
            mockPlayerId
        );
        expect(
            game.currentRound?.whiteCardsByPlayer[0].whiteCards
        ).toHaveLength(2);
        expect(
            game.currentRound?.whiteCardsByPlayer[0].whiteCards
        ).toContainEqual(mockWhiteCards[0]);
        expect(
            game.currentRound?.whiteCardsByPlayer[0].whiteCards
        ).toContainEqual(mockWhiteCards[2]);
        expect(game.cards.playedWhiteCards).toContain(mockWhiteCards[0]);
        expect(game.cards.playedWhiteCards).toContain(mockWhiteCards[2]);
        expect(game.cards.playedWhiteCards).toHaveLength(2);
    });

    it("Changes game state to reading cards phase when last player plays white cards", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        const newPlayer = createPlayer(mockPlayerId, true, false);

        const mockWhiteCards = createWhiteCards(5, mockPackId);
        newPlayer.whiteCards = mockWhiteCards;
        newPlayer.state = "playing";
        newGame.players = [createPlayer("cardCzar", false, true), newPlayer];
        newGame.stateMachine.jumpTo("playingWhiteCards");

        newGame.currentRound = createRound("cardCzar", createBlackCard(1));

        mockGetGame(newGame);

        await playWhiteCards(
            ioMock,
            socketMock,
            mockGameId,
            mockPlayerId,
            [mockWhiteCards[1].id],
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("readingCards");
        expect(
            game.players.find((player) => player.id === mockPlayerId)?.state
        ).toBe("waiting");
        expect(game.currentRound?.whiteCardsByPlayer[0].playerID).toBe(
            mockPlayerId
        );
        expect(
            game.currentRound?.whiteCardsByPlayer[0].whiteCards
        ).toHaveLength(1);
        expect(
            game.currentRound?.whiteCardsByPlayer[0].whiteCards
        ).toContainEqual(mockWhiteCards[1]);
        expect(game.cards.playedWhiteCards).toContain(mockWhiteCards[1]);
        expect(game.cards.playedWhiteCards).toHaveLength(1);
    });

    it("Doesn't allow playing cards you don't have", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        const newPlayer = createPlayer(mockPlayerId, true, false);

        const mockWhiteCards = createWhiteCards(5, mockPackId);
        newPlayer.whiteCards = mockWhiteCards;
        newPlayer.state = "playing";
        newGame.players = [createPlayer("cardCzar", false, true), newPlayer];
        newGame.stateMachine.jumpTo("playingWhiteCards");

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));

        mockGetGame(newGame);
        const mockNotification = mockSendNotification();

        await playWhiteCards(
            ioMock,
            socketMock,
            mockGameId,
            mockPlayerId,
            ["some random id", "some random id 2"],
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(mockNotification).toHaveBeenCalledWith(
            ERROR_TYPES.otherError,
            expect.anything(),
            expect.anything()
        );
    });

    it("Doesn't allow playing less cards than required", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        const newPlayer = createPlayer(mockPlayerId, true, false);

        const mockWhiteCards = createWhiteCards(5, mockPackId);
        newPlayer.whiteCards = mockWhiteCards;
        newPlayer.state = "playing";
        newGame.players = [createPlayer("cardCzar", false, true), newPlayer];
        newGame.stateMachine.jumpTo("playingWhiteCards");

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));

        mockGetGame(newGame);
        const mockNotification = mockSendNotification();

        await playWhiteCards(
            ioMock,
            socketMock,
            mockGameId,
            mockPlayerId,
            [mockWhiteCards[4].id],
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(mockNotification).toHaveBeenCalledWith(
            ERROR_TYPES.otherError,
            expect.anything(),
            expect.anything()
        );
    });

    it("Doesn't allow playing more cards than required", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        const newPlayer = createPlayer(mockPlayerId, true, false);

        const mockWhiteCards = createWhiteCards(5, mockPackId);
        newPlayer.whiteCards = mockWhiteCards;
        newPlayer.state = "playing";
        newGame.players = [createPlayer("cardCzar", false, true), newPlayer];
        newGame.stateMachine.jumpTo("playingWhiteCards");

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));

        mockGetGame(newGame);
        const mockNotification = mockSendNotification();

        await playWhiteCards(
            ioMock,
            socketMock,
            mockGameId,
            mockPlayerId,
            [mockWhiteCards[4].id, mockWhiteCards[2].id, mockWhiteCards[0].id],
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(mockNotification).toHaveBeenCalledWith(
            ERROR_TYPES.otherError,
            expect.anything(),
            expect.anything()
        );
    });

    it("Doesn't allow card czar to play white cards", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        const newPlayer = createPlayer("cardCzar", true, true);

        const mockWhiteCards = createWhiteCards(5, mockPackId);
        newPlayer.whiteCards = mockWhiteCards;
        newPlayer.state = "playing";
        newGame.players = [
            createPlayer("notCardCzar", false, false),
            newPlayer,
        ];
        newGame.stateMachine.jumpTo("playingWhiteCards");

        newGame.currentRound = createRound("cardCzar", createBlackCard(1));

        mockGetGame(newGame);
        const mockNotification = mockSendNotification();

        await playWhiteCards(
            ioMock,
            socketMock,
            mockGameId,
            "cardCzar",
            [mockWhiteCards[2].id],
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(mockNotification).toHaveBeenCalledWith(
            ERROR_TYPES.forbiddenPlayerAction,
            expect.anything(),
            expect.anything()
        );
    });

    it("Doesn't allow player to play white cards in incorrect game phase", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        const newPlayer = createPlayer(mockPlayerId, true, false);

        const mockWhiteCards = createWhiteCards(5, mockPackId);
        newPlayer.whiteCards = mockWhiteCards;
        newPlayer.state = "playing";
        newGame.players = [createPlayer("cardCzar", false, true), newPlayer];
        newGame.stateMachine.jumpTo("showingCards");

        newGame.currentRound = createRound("cardCzar", createBlackCard(1));

        mockGetGame(newGame);
        const mockNotification = mockSendNotification();

        await playWhiteCards(
            ioMock,
            socketMock,
            mockGameId,
            mockPlayerId,
            [mockWhiteCards[2].id],
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(mockNotification).toHaveBeenCalledWith(
            ERROR_TYPES.incorrectGameState,
            expect.anything(),
            expect.anything()
        );
    });

    it("Doesn't allow player to play multiple same white cards", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        const newPlayer = createPlayer(mockPlayerId, true, false);

        const mockWhiteCards = createWhiteCards(5, mockPackId);
        newPlayer.whiteCards = mockWhiteCards;
        newPlayer.state = "playing";
        newGame.players = [createPlayer("cardCzar", false, true), newPlayer];
        newGame.stateMachine.jumpTo("playingWhiteCards");

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));

        mockGetGame(newGame);
        const mockNotification = mockSendNotification();

        await playWhiteCards(
            ioMock,
            socketMock,
            mockGameId,
            mockPlayerId,
            [mockWhiteCards[2].id, mockWhiteCards[2].id],
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(mockNotification).toHaveBeenCalledWith(
            ERROR_TYPES.otherError,
            expect.anything(),
            expect.anything()
        );
    });

    it("Doesn't allow player to play multiple times", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        const newPlayer = createPlayer(mockPlayerId, true, false);

        const mockWhiteCards = createWhiteCards(5, mockPackId);
        newPlayer.whiteCards = mockWhiteCards;
        newPlayer.state = "playing";
        newGame.players = [
            createPlayer("cardCzar", false, true),
            newPlayer,
            createPlayer("random id", false, false),
        ];
        newGame.stateMachine.jumpTo("playingWhiteCards");

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));

        mockGetGame(newGame);
        const mockNotification = mockSendNotification();

        await playWhiteCards(
            ioMock,
            socketMock,
            mockGameId,
            mockPlayerId,
            [mockWhiteCards[0].id, mockWhiteCards[1].id],
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("playingWhiteCards");
        expect(
            game.players.find((player) => player.id === mockPlayerId)?.state
        ).toBe("waiting");
        expect(game.currentRound?.whiteCardsByPlayer[0].playerID).toBe(
            mockPlayerId
        );

        await playWhiteCards(
            ioMock,
            socketMock,
            mockGameId,
            mockPlayerId,
            [mockWhiteCards[2].id, mockWhiteCards[3].id],
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        expect(mockNotification).toHaveBeenCalledWith(
            ERROR_TYPES.otherError,
            expect.anything(),
            expect.anything()
        );
    });

    it("Doesn't allow a spectator to play white cards", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        const newPlayer = createPlayer(mockPlayerId, true, false);

        const mockWhiteCards = createWhiteCards(5, mockPackId);
        newPlayer.whiteCards = mockWhiteCards;
        newPlayer.state = "spectating";
        newGame.players = [createPlayer("cardCzar", false, true), newPlayer];
        newGame.stateMachine.jumpTo("playingWhiteCards");

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));

        mockGetGame(newGame);
        const mockNotification = mockSendNotification();

        await playWhiteCards(
            ioMock,
            socketMock,
            mockGameId,
            mockPlayerId,
            [mockWhiteCards[2].id, mockWhiteCards[2].id],
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(mockNotification).toHaveBeenCalledWith(
            ERROR_TYPES.otherError,
            expect.anything(),
            expect.anything()
        );
    });
});

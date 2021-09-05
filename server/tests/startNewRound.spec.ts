import { BlackCard, Game, Player, WhiteCard, WhiteCardsByPlayer } from "types";
import {
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
import { gameOptions } from "../consts/gameSettings";
import { newGameTemplate } from "../modules/games/newGame";
import { startNewRound } from "../modules/rounds/startRound";

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

const createWhiteCardsByPlayer = (
    playerId: string,
    whiteCards: WhiteCard[]
) => {
    const cards: WhiteCardsByPlayer = {
        playerID: playerId,
        playerName: playerId,
        popularVotes: [],
        wonRound: false,
        popularVote: 0,
        whiteCards: whiteCards,
    };
    return cards;
};

beforeAll(() => {
    jest.useFakeTimers();
});

afterAll(() => {
    jest.useRealTimers();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("Start New Round", () => {
    it("Allows card czar to start new round", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const whiteCards = createWhiteCards(100);

        const winner = createPlayer("winner");
        winner.whiteCards = whiteCards.splice(0, 10);
        const host = createPlayer("host", true);
        host.whiteCards = whiteCards.splice(0, 10);
        const cardCzar = createPlayer("cardCzar", false, true);
        cardCzar.whiteCards = whiteCards.splice(0, 10);

        newGame.players = [host, cardCzar, winner];
        newGame.stateMachine.jumpTo("roundEnd");
        newGame.cards.whiteCards = whiteCards;

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));
        newGame.currentRound.whiteCardsByPlayer = [
            createWhiteCardsByPlayer(winner.id, winner.whiteCards.splice(0, 2)),
            createWhiteCardsByPlayer(host.id, host.whiteCards.splice(0, 2)),
            createWhiteCardsByPlayer(cardCzar.id, cardCzar.whiteCards),
        ];

        mockGetGame(newGame);

        await startNewRound(
            ioMock,
            socketMock,
            mockGameId,
            "cardCzar",
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("pickingBlackCard");

        expect(game.players[1].isCardCzar).toBe(false);
        expect(game.players[2].isCardCzar).toBe(true);

        expect(game.players[0].state).toBe("waiting");
        expect(game.players[1].state).toBe("waiting");
        expect(game.players[2].state).toBe("playing");

        expect(
            game.players.every(
                (player) =>
                    player.whiteCards.length ===
                    gameOptions.startingWhiteCardCount
            )
        ).toBe(true);
    });

    it("Makes winner the next card czar when that option is used", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const whiteCards = createWhiteCards(100);

        const winner = createPlayer("winner");
        winner.whiteCards = whiteCards.splice(0, 10);
        const host = createPlayer("host", true);
        host.whiteCards = whiteCards.splice(0, 10);
        const cardCzar = createPlayer("cardCzar", false, true);
        cardCzar.whiteCards = whiteCards.splice(0, 10);

        newGame.players = [host, cardCzar, winner];
        newGame.stateMachine.jumpTo("roundEnd");
        newGame.cards.whiteCards = whiteCards;

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));
        newGame.currentRound.whiteCardsByPlayer = [
            createWhiteCardsByPlayer(host.id, host.whiteCards.splice(0, 2)),
            createWhiteCardsByPlayer(winner.id, winner.whiteCards.splice(0, 2)),
            createWhiteCardsByPlayer(cardCzar.id, cardCzar.whiteCards),
        ];
        newGame.currentRound.whiteCardsByPlayer[0].wonRound = true;
        newGame.client.options.winnerBecomesCardCzar = true;

        mockGetGame(newGame);

        await startNewRound(
            ioMock,
            socketMock,
            mockGameId,
            "cardCzar",
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("pickingBlackCard");

        expect(game.players[0].isCardCzar).toBe(true);
        expect(game.players[1].isCardCzar).toBe(false);
        expect(game.players[2].isCardCzar).toBe(false);

        expect(game.players[0].state).toBe("playing");
        expect(game.players[1].state).toBe("waiting");
        expect(game.players[2].state).toBe("waiting");
    });

    it("Shows who is the popular vote leader", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const whiteCards = createWhiteCards(100);

        const winner = createPlayer("winner");
        winner.whiteCards = whiteCards.splice(0, 10);
        const host = createPlayer("host", true);
        host.whiteCards = whiteCards.splice(0, 10);
        const cardCzar = createPlayer("cardCzar", false, true);
        cardCzar.whiteCards = whiteCards.splice(0, 10);

        newGame.players = [host, cardCzar, winner];
        newGame.stateMachine.jumpTo("roundEnd");
        newGame.cards.whiteCards = whiteCards;

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));
        newGame.currentRound.whiteCardsByPlayer = [
            createWhiteCardsByPlayer(host.id, host.whiteCards.splice(0, 2)),
            createWhiteCardsByPlayer(winner.id, winner.whiteCards.splice(0, 2)),
            createWhiteCardsByPlayer(cardCzar.id, cardCzar.whiteCards),
        ];
        newGame.players[0].popularVoteScore = 2;

        mockGetGame(newGame);

        await startNewRound(
            ioMock,
            socketMock,
            mockGameId,
            "cardCzar",
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("pickingBlackCard");

        expect(game.players[0].isPopularVoteKing).toBe(true);
        expect(game.players[1].isPopularVoteKing).toBe(false);
        expect(game.players[2].isPopularVoteKing).toBe(false);
    });

    it("Allows multiple popular vote leaders", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const whiteCards = createWhiteCards(100);

        const winner = createPlayer("winner");
        winner.whiteCards = whiteCards.splice(0, 10);
        const host = createPlayer("host", true);
        host.whiteCards = whiteCards.splice(0, 10);
        const cardCzar = createPlayer("cardCzar", false, true);
        cardCzar.whiteCards = whiteCards.splice(0, 10);

        newGame.players = [host, cardCzar, winner];
        newGame.stateMachine.jumpTo("roundEnd");
        newGame.cards.whiteCards = whiteCards;

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));
        newGame.currentRound.whiteCardsByPlayer = [
            createWhiteCardsByPlayer(host.id, host.whiteCards.splice(0, 2)),
            createWhiteCardsByPlayer(winner.id, winner.whiteCards.splice(0, 2)),
            createWhiteCardsByPlayer(cardCzar.id, cardCzar.whiteCards),
        ];
        newGame.players[0].popularVoteScore = 2;
        newGame.players[1].popularVoteScore = 2;

        mockGetGame(newGame);

        await startNewRound(
            ioMock,
            socketMock,
            mockGameId,
            "cardCzar",
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("pickingBlackCard");

        expect(game.players[0].isPopularVoteKing).toBe(true);
        expect(game.players[1].isPopularVoteKing).toBe(true);
        expect(game.players[2].isPopularVoteKing).toBe(false);
    });

    it("Doesn't allow non card czar to start new round", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const whiteCards = createWhiteCards(100);

        const winner = createPlayer("winner");
        winner.whiteCards = whiteCards.splice(0, 10);
        const host = createPlayer("host", true);
        host.whiteCards = whiteCards.splice(0, 10);
        const cardCzar = createPlayer("cardCzar", false, true);
        cardCzar.whiteCards = whiteCards.splice(0, 10);

        newGame.players = [host, cardCzar, winner];
        newGame.stateMachine.jumpTo("roundEnd");
        newGame.cards.whiteCards = whiteCards;

        mockGetGame(newGame);
        const notificationMock = mockSendNotification();

        await startNewRound(
            ioMock,
            socketMock,
            mockGameId,
            "host",
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(notificationMock).toHaveBeenCalledWith(
            ERROR_TYPES.forbiddenCardCzarAction,
            expect.anything(),
            expect.anything()
        );
    });

    it("Doesn't allow card czar to start new round in incorrect game state", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const whiteCards = createWhiteCards(100);

        const winner = createPlayer("winner");
        winner.whiteCards = whiteCards.splice(0, 10);
        const host = createPlayer("host", true);
        host.whiteCards = whiteCards.splice(0, 10);
        const cardCzar = createPlayer("cardCzar", false, true);
        cardCzar.whiteCards = whiteCards.splice(0, 10);

        newGame.players = [host, cardCzar, winner];
        newGame.stateMachine.jumpTo("readingCards");
        newGame.cards.whiteCards = whiteCards;

        mockGetGame(newGame);
        const notificationMock = mockSendNotification();

        await startNewRound(
            ioMock,
            socketMock,
            mockGameId,
            "cardCzar",
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(notificationMock).toHaveBeenCalledWith(
            ERROR_TYPES.incorrectGameState,
            expect.anything(),
            expect.anything()
        );
    });

    it("Ends game if score limit is reached", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const whiteCards = createWhiteCards(100);

        const winner = createPlayer("winner");
        winner.whiteCards = whiteCards.splice(0, 10);
        winner.score = 5;
        const host = createPlayer("host", true);
        host.whiteCards = whiteCards.splice(0, 10);
        const cardCzar = createPlayer("cardCzar", false, true);
        cardCzar.whiteCards = whiteCards.splice(0, 10);

        newGame.players = [host, cardCzar, winner];
        newGame.stateMachine.jumpTo("roundEnd");
        newGame.cards.whiteCards = whiteCards;
        newGame.client.options.winConditions.scoreLimit = 5;
        newGame.client.options.winConditions.useScoreLimit = true;

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));
        newGame.currentRound.whiteCardsByPlayer = [
            createWhiteCardsByPlayer(host.id, host.whiteCards.splice(0, 2)),
            createWhiteCardsByPlayer(winner.id, winner.whiteCards.splice(0, 2)),
            createWhiteCardsByPlayer(cardCzar.id, cardCzar.whiteCards),
        ];

        mockGetGame(newGame);

        await startNewRound(
            ioMock,
            socketMock,
            mockGameId,
            "cardCzar",
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("gameOver");
    });

    it("Ends game if round limit is reached", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const whiteCards = createWhiteCards(100);

        const winner = createPlayer("winner");
        winner.whiteCards = whiteCards.splice(0, 10);
        const host = createPlayer("host", true);
        host.whiteCards = whiteCards.splice(0, 10);
        const cardCzar = createPlayer("cardCzar", false, true);
        cardCzar.whiteCards = whiteCards.splice(0, 10);

        newGame.players = [host, cardCzar, winner];
        newGame.stateMachine.jumpTo("roundEnd");
        newGame.cards.whiteCards = whiteCards;
        newGame.client.options.winConditions.roundLimit = 2;
        newGame.client.options.winConditions.useRoundLimit = true;

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));
        newGame.currentRound.whiteCardsByPlayer = [
            createWhiteCardsByPlayer(host.id, host.whiteCards.splice(0, 2)),
            createWhiteCardsByPlayer(winner.id, winner.whiteCards.splice(0, 2)),
            createWhiteCardsByPlayer(cardCzar.id, cardCzar.whiteCards),
        ];
        newGame.client.rounds = [
            createRound("host", createBlackCard(1)),
            newGame.currentRound,
        ];

        mockGetGame(newGame);

        await startNewRound(
            ioMock,
            socketMock,
            mockGameId,
            "cardCzar",
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("gameOver");
    });
});

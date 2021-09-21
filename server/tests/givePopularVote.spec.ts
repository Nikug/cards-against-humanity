import { BlackCard, Game, WhiteCard, WhiteCardsByPlayer } from "types";
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
import { popularVote } from "../modules/cards/popularVote";

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

describe("Give Popular Vote", () => {
    it("Allows player to give popular vote", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.jumpTo("showingCards");

        const whiteCards = createWhiteCards(20);

        const host = createPlayer("host", true);
        host.whiteCards = whiteCards.splice(0, 2);
        const cardCzar = createPlayer("cardCzar", false, true);
        cardCzar.whiteCards = whiteCards.splice(0, 2);
        const player = createPlayer(mockPlayerId, false, true);
        player.whiteCards = whiteCards.splice(0, 2);

        newGame.players = [host, cardCzar, player];

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));
        newGame.currentRound.whiteCardsByPlayer = [
            createWhiteCardsByPlayer(host.id, host.whiteCards),
            createWhiteCardsByPlayer(player.id, player.whiteCards),
        ];

        mockGetGame(newGame);

        await popularVote(
            ioMock,
            socketMock,
            mockGameId,
            mockPlayerId,
            host.whiteCards.map((card) => card.id),
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("showingCards");
        expect(game.currentRound?.whiteCardsByPlayer[0].playerID).toBe("host");
        expect(game.currentRound?.whiteCardsByPlayer[0].popularVote).toBe(1);
        expect(game.currentRound?.whiteCardsByPlayer[0].popularVotes[0]).toBe(
            mockPlayerId
        );
        expect(game.players[0].popularVoteScore).toBe(1);
    });

    it("Allows two players to popular vote same cards", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.jumpTo("roundEnd");

        const whiteCards = createWhiteCards(20);

        const host = createPlayer("host", true);
        host.whiteCards = whiteCards.splice(0, 2);
        const cardCzar = createPlayer("cardCzar", false, true);
        cardCzar.whiteCards = whiteCards.splice(0, 2);
        const player1 = createPlayer("player1", false, true);
        player1.whiteCards = whiteCards.splice(0, 2);
        const player2 = createPlayer("player2", false, true);
        player2.whiteCards = whiteCards.splice(0, 2);

        newGame.players = [host, cardCzar, player1, player2];

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));
        newGame.currentRound.whiteCardsByPlayer = [
            createWhiteCardsByPlayer(host.id, host.whiteCards),
            createWhiteCardsByPlayer(player1.id, player1.whiteCards),
            createWhiteCardsByPlayer(player2.id, player2.whiteCards),
        ];

        mockGetGame(newGame);

        await popularVote(
            ioMock,
            socketMock,
            mockGameId,
            "player1",
            host.whiteCards.map((card) => card.id),
            pgClientMock
        );

        await popularVote(
            ioMock,
            socketMock,
            mockGameId,
            "player2",
            host.whiteCards.map((card) => card.id),
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(2);
        const game: Game = await mockSet.mock.results[1].value;
        expect(game.currentRound?.whiteCardsByPlayer[0].playerID).toBe("host");
        expect(game.currentRound?.whiteCardsByPlayer[0].popularVote).toBe(2);
        expect(game.currentRound?.whiteCardsByPlayer[0].popularVotes[0]).toBe(
            "player1"
        );
        expect(game.currentRound?.whiteCardsByPlayer[0].popularVotes[1]).toBe(
            "player2"
        );
        expect(game.players[0].popularVoteScore).toBe(2);
    });

    it("Allows one player to popular vote multiple different cards", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.jumpTo("readingCards");

        const whiteCards = createWhiteCards(20);

        const host = createPlayer("host", true);
        host.whiteCards = whiteCards.splice(0, 2);
        const cardCzar = createPlayer("cardCzar", false, true);
        cardCzar.whiteCards = whiteCards.splice(0, 2);
        const player1 = createPlayer("player1", false, true);
        player1.whiteCards = whiteCards.splice(0, 2);
        const player2 = createPlayer("player2", false, true);
        player2.whiteCards = whiteCards.splice(0, 2);

        newGame.players = [host, cardCzar, player1, player2];

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));
        newGame.currentRound.whiteCardsByPlayer = [
            createWhiteCardsByPlayer(host.id, host.whiteCards),
            createWhiteCardsByPlayer(player1.id, player1.whiteCards),
            createWhiteCardsByPlayer(player2.id, player2.whiteCards),
        ];

        mockGetGame(newGame);

        await popularVote(
            ioMock,
            socketMock,
            mockGameId,
            "player1",
            host.whiteCards.map((card) => card.id),
            pgClientMock
        );

        await popularVote(
            ioMock,
            socketMock,
            mockGameId,
            "player1",
            player2.whiteCards.map((card) => card.id),
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(2);
        const game: Game = await mockSet.mock.results[1].value;
        expect(game.currentRound?.whiteCardsByPlayer[0].playerID).toBe("host");
        expect(game.currentRound?.whiteCardsByPlayer[0].popularVote).toBe(1);
        expect(game.currentRound?.whiteCardsByPlayer[2].playerID).toBe(
            "player2"
        );
        expect(game.currentRound?.whiteCardsByPlayer[2].popularVote).toBe(1);
        expect(game.currentRound?.whiteCardsByPlayer[0].popularVotes[0]).toBe(
            "player1"
        );
        expect(game.currentRound?.whiteCardsByPlayer[2].popularVotes[0]).toBe(
            "player1"
        );
        expect(game.players[0].popularVoteScore).toBe(1);
        expect(game.players[3].popularVoteScore).toBe(1);
    });

    it("Allows card czar to popular vote when it is allowed", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.jumpTo("showingCards");

        const whiteCards = createWhiteCards(20);

        const host = createPlayer("host", true);
        host.whiteCards = whiteCards.splice(0, 2);
        const cardCzar = createPlayer("cardCzar", false, true);
        cardCzar.whiteCards = whiteCards.splice(0, 2);
        const player = createPlayer(mockPlayerId, false, true);
        player.whiteCards = whiteCards.splice(0, 2);

        newGame.players = [host, cardCzar, player];
        newGame.client.options.allowCardCzarPopularVote = true;

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));
        newGame.currentRound.whiteCardsByPlayer = [
            createWhiteCardsByPlayer(host.id, host.whiteCards),
            createWhiteCardsByPlayer(player.id, player.whiteCards),
        ];

        mockGetGame(newGame);

        await popularVote(
            ioMock,
            socketMock,
            mockGameId,
            "cardCzar",
            host.whiteCards.map((card) => card.id),
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.currentRound?.whiteCardsByPlayer[0].playerID).toBe("host");
        expect(game.currentRound?.whiteCardsByPlayer[0].popularVote).toBe(1);
        expect(game.currentRound?.whiteCardsByPlayer[0].popularVotes[0]).toBe(
            "cardCzar"
        );
        expect(game.players[0].popularVoteScore).toBe(1);
    });

    it("Doesn't allow card czar to popular vote when it is not allowed", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.jumpTo("showingCards");

        const whiteCards = createWhiteCards(20);

        const host = createPlayer("host", true);
        host.whiteCards = whiteCards.splice(0, 2);
        const cardCzar = createPlayer("cardCzar", false, true);
        cardCzar.whiteCards = whiteCards.splice(0, 2);
        const player = createPlayer(mockPlayerId, false, true);
        player.whiteCards = whiteCards.splice(0, 2);

        newGame.players = [host, cardCzar, player];
        newGame.client.options.allowCardCzarPopularVote = false;

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));
        newGame.currentRound.whiteCardsByPlayer = [
            createWhiteCardsByPlayer(host.id, host.whiteCards),
            createWhiteCardsByPlayer(player.id, player.whiteCards),
        ];

        mockGetGame(newGame);
        const notificationMock = mockSendNotification();

        await popularVote(
            ioMock,
            socketMock,
            mockGameId,
            "cardCzar",
            host.whiteCards.map((card) => card.id),
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(notificationMock).toHaveBeenCalledWith(
            ERROR_TYPES.forbiddenPlayerAction,
            expect.anything(),
            expect.anything()
        );
    });

    // TODO: Send notification when trying to popular same cards vote twice
    it.skip("Doesn't allow player to popular vote same cards twice", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.jumpTo("showingCards");

        const whiteCards = createWhiteCards(20);

        const host = createPlayer("host", true);
        host.whiteCards = whiteCards.splice(0, 2);
        const cardCzar = createPlayer("cardCzar", false, true);
        cardCzar.whiteCards = whiteCards.splice(0, 2);
        const player = createPlayer(mockPlayerId, false, true);
        player.whiteCards = whiteCards.splice(0, 2);

        newGame.players = [host, cardCzar, player];

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));
        newGame.currentRound.whiteCardsByPlayer = [
            createWhiteCardsByPlayer(host.id, host.whiteCards),
            createWhiteCardsByPlayer(player.id, player.whiteCards),
        ];

        mockGetGame(newGame);
        const notificationMock = mockSendNotification();

        await popularVote(
            ioMock,
            socketMock,
            mockGameId,
            mockPlayerId,
            host.whiteCards.map((card) => card.id),
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.currentRound?.whiteCardsByPlayer[0].playerID).toBe("host");
        expect(game.currentRound?.whiteCardsByPlayer[0].popularVote).toBe(1);

        await popularVote(
            ioMock,
            socketMock,
            mockGameId,
            mockPlayerId,
            host.whiteCards.map((card) => card.id),
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        expect(game.currentRound?.whiteCardsByPlayer[0].popularVote).toBe(1);
        expect(notificationMock).toHaveBeenCalledWith(
            ERROR_TYPES.forbiddenPlayerAction,
            expect.anything(),
            expect.anything()
        );
    });

    it("Doesn't allow player to popular vote themselves", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.jumpTo("showingCards");

        const whiteCards = createWhiteCards(20);

        const host = createPlayer("host", true);
        host.whiteCards = whiteCards.splice(0, 2);
        const cardCzar = createPlayer("cardCzar", false, true);
        cardCzar.whiteCards = whiteCards.splice(0, 2);

        newGame.players = [host, cardCzar];

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));
        newGame.currentRound.whiteCardsByPlayer = [
            createWhiteCardsByPlayer(host.id, host.whiteCards),
        ];

        mockGetGame(newGame);

        await popularVote(
            ioMock,
            socketMock,
            mockGameId,
            "host",
            host.whiteCards.map((card) => card.id),
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
    });

    it("Doesn't allow popular vote in incorrect game phase", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.jumpTo("pickingBlackCard");

        const whiteCards = createWhiteCards(20);

        const host = createPlayer("host", true);
        host.whiteCards = whiteCards.splice(0, 2);
        const cardCzar = createPlayer("cardCzar", false, true);
        cardCzar.whiteCards = whiteCards.splice(0, 2);
        const player = createPlayer(mockPlayerId, false, true);
        player.whiteCards = whiteCards.splice(0, 2);

        newGame.players = [host, cardCzar, player];

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));
        newGame.currentRound.whiteCardsByPlayer = [
            createWhiteCardsByPlayer(host.id, host.whiteCards),
            createWhiteCardsByPlayer(player.id, player.whiteCards),
        ];

        mockGetGame(newGame);
        const notificationMock = mockSendNotification();

        await popularVote(
            ioMock,
            socketMock,
            mockGameId,
            mockPlayerId,
            host.whiteCards.map((card) => card.id),
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(notificationMock).toHaveBeenCalledWith(
            ERROR_TYPES.incorrectGameState,
            expect.anything(),
            expect.anything()
        );
    });

    it("Requires all card ids to popular vote", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.jumpTo("showingCards");

        const whiteCards = createWhiteCards(20);

        const host = createPlayer("host", true);
        host.whiteCards = whiteCards.splice(0, 2);
        const cardCzar = createPlayer("cardCzar", false, true);
        cardCzar.whiteCards = whiteCards.splice(0, 2);
        const player = createPlayer(mockPlayerId, false, true);
        player.whiteCards = whiteCards.splice(0, 2);

        newGame.players = [host, cardCzar, player];

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));
        newGame.currentRound.whiteCardsByPlayer = [
            createWhiteCardsByPlayer(host.id, host.whiteCards),
            createWhiteCardsByPlayer(player.id, player.whiteCards),
        ];

        mockGetGame(newGame);

        await popularVote(
            ioMock,
            socketMock,
            mockGameId,
            mockPlayerId,
            [host.whiteCards[0].id],
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
    });
});

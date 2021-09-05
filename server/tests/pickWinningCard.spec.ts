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
import { newGameTemplate } from "../modules/games/newGame";
import { selectWinner } from "../modules/rounds/selectWinner";

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

const getPlayerIds = (players: Player[]) => players.map((player) => player.id);

beforeAll(() => {
    jest.useFakeTimers();
});

afterAll(() => {
    jest.useRealTimers();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("Pick Winning Card", () => {
    it("Allows card czar to pick a winning cards", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const whiteCards = createWhiteCards(6);

        const winner = createPlayer("winner");
        winner.whiteCards = [whiteCards[0], whiteCards[1]];
        const host = createPlayer("host", true);
        host.whiteCards = [whiteCards[2], whiteCards[3]];
        const cardCzar = createPlayer("cardCzar", false, true);
        cardCzar.whiteCards = [whiteCards[4], whiteCards[5]];

        newGame.players = [host, cardCzar, winner];
        newGame.stateMachine.jumpTo("showingCards");

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));
        newGame.currentRound.whiteCardsByPlayer = [
            createWhiteCardsByPlayer(winner.id, winner.whiteCards),
            createWhiteCardsByPlayer(host.id, host.whiteCards),
            createWhiteCardsByPlayer(cardCzar.id, cardCzar.whiteCards),
        ];
        const winningCards =
            newGame.currentRound.whiteCardsByPlayer[0].whiteCards.map(
                (card) => card.id
            );

        mockGetGame(newGame);

        await selectWinner(
            ioMock,
            socketMock,
            mockGameId,
            "cardCzar",
            [winningCards[1], winningCards[0]],
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("roundEnd");
        expect(game.currentRound?.whiteCardsByPlayer[0].wonRound).toBe(true);
        expect(game.streak?.id).toBe(winner.id);
        expect(game.streak?.wins).toBe(1);
        expect(game.players[2].score).toBe(1);
    });

    it("Winner can be a spectator", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const whiteCards = createWhiteCards(6);

        const winner = createPlayer("winner");
        winner.whiteCards = [whiteCards[0], whiteCards[1]];
        winner.state = "spectating";
        const host = createPlayer("host", true);
        host.whiteCards = [whiteCards[2], whiteCards[3]];
        const cardCzar = createPlayer("cardCzar", false, true);
        cardCzar.whiteCards = [whiteCards[4], whiteCards[5]];

        newGame.players = [host, cardCzar, winner];
        newGame.stateMachine.jumpTo("showingCards");

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));
        newGame.currentRound.whiteCardsByPlayer = [
            createWhiteCardsByPlayer(winner.id, winner.whiteCards),
            createWhiteCardsByPlayer(host.id, host.whiteCards),
            createWhiteCardsByPlayer(cardCzar.id, cardCzar.whiteCards),
        ];
        const winningCards =
            newGame.currentRound.whiteCardsByPlayer[0].whiteCards.map(
                (card) => card.id
            );

        mockGetGame(newGame);

        await selectWinner(
            ioMock,
            socketMock,
            mockGameId,
            "cardCzar",
            [winningCards[1], winningCards[0]],
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("roundEnd");
        expect(game.currentRound?.whiteCardsByPlayer[0].wonRound).toBe(true);
        expect(game.streak?.id).toBe(winner.id);
        expect(game.streak?.wins).toBe(1);
        expect(game.players[2].score).toBe(1);
    });

    it("Winner can be disconnected", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const whiteCards = createWhiteCards(6);

        const winner = createPlayer("winner");
        winner.whiteCards = [whiteCards[0], whiteCards[1]];
        winner.state = "disconnected";
        const host = createPlayer("host", true);
        host.whiteCards = [whiteCards[2], whiteCards[3]];
        const cardCzar = createPlayer("cardCzar", false, true);
        cardCzar.whiteCards = [whiteCards[4], whiteCards[5]];

        newGame.players = [host, cardCzar, winner];
        newGame.stateMachine.jumpTo("showingCards");

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));
        newGame.currentRound.whiteCardsByPlayer = [
            createWhiteCardsByPlayer(winner.id, winner.whiteCards),
            createWhiteCardsByPlayer(host.id, host.whiteCards),
            createWhiteCardsByPlayer(cardCzar.id, cardCzar.whiteCards),
        ];
        const winningCards =
            newGame.currentRound.whiteCardsByPlayer[0].whiteCards.map(
                (card) => card.id
            );

        mockGetGame(newGame);

        await selectWinner(
            ioMock,
            socketMock,
            mockGameId,
            "cardCzar",
            [winningCards[1], winningCards[0]],
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("roundEnd");
        expect(game.currentRound?.whiteCardsByPlayer[0].wonRound).toBe(true);
        expect(game.streak?.id).toBe(winner.id);
        expect(game.streak?.wins).toBe(1);
        expect(game.players[2].score).toBe(1);
    });

    it("Doesn't allow non card czar to pick winning cards", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const whiteCards = createWhiteCards(6);

        const winner = createPlayer("winner");
        winner.whiteCards = [whiteCards[0], whiteCards[1]];
        const host = createPlayer("host", true);
        host.whiteCards = [whiteCards[2], whiteCards[3]];
        const cardCzar = createPlayer("cardCzar", false, true);
        cardCzar.whiteCards = [whiteCards[4], whiteCards[5]];

        newGame.players = [host, cardCzar, winner];
        newGame.stateMachine.jumpTo("showingCards");

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));
        newGame.currentRound.whiteCardsByPlayer = [
            createWhiteCardsByPlayer(winner.id, winner.whiteCards),
            createWhiteCardsByPlayer(host.id, host.whiteCards),
            createWhiteCardsByPlayer(cardCzar.id, cardCzar.whiteCards),
        ];
        const winningCards =
            newGame.currentRound.whiteCardsByPlayer[0].whiteCards.map(
                (card) => card.id
            );

        mockGetGame(newGame);
        const notificationMock = mockSendNotification();

        await selectWinner(
            ioMock,
            socketMock,
            mockGameId,
            "winner",
            winningCards,
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(notificationMock).toHaveBeenCalledWith(
            ERROR_TYPES.forbiddenCardCzarAction,
            expect.anything(),
            expect.anything()
        );
    });

    it("Doesn't allow picking winner in incorrect game state", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const whiteCards = createWhiteCards(6);

        const winner = createPlayer("winner");
        winner.whiteCards = [whiteCards[0], whiteCards[1]];
        const host = createPlayer("host", true);
        host.whiteCards = [whiteCards[2], whiteCards[3]];
        const cardCzar = createPlayer("cardCzar", false, true);
        cardCzar.whiteCards = [whiteCards[4], whiteCards[5]];

        newGame.players = [host, cardCzar, winner];
        newGame.stateMachine.jumpTo("pickingBlackCard");

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));
        newGame.currentRound.whiteCardsByPlayer = [
            createWhiteCardsByPlayer(winner.id, winner.whiteCards),
            createWhiteCardsByPlayer(host.id, host.whiteCards),
            createWhiteCardsByPlayer(cardCzar.id, cardCzar.whiteCards),
        ];
        const winningCards =
            newGame.currentRound.whiteCardsByPlayer[0].whiteCards.map(
                (card) => card.id
            );

        mockGetGame(newGame);
        const notificationMock = mockSendNotification();

        await selectWinner(
            ioMock,
            socketMock,
            mockGameId,
            "cardCzar",
            winningCards,
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(notificationMock).toHaveBeenCalledWith(
            ERROR_TYPES.incorrectGameState,
            expect.anything(),
            expect.anything()
        );
    });

    it("Must send all winning cards back", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const whiteCards = createWhiteCards(6);

        const winner = createPlayer("winner");
        winner.whiteCards = [whiteCards[0], whiteCards[1]];
        const host = createPlayer("host", true);
        host.whiteCards = [whiteCards[2], whiteCards[3]];
        const cardCzar = createPlayer("cardCzar", false, true);
        cardCzar.whiteCards = [whiteCards[4], whiteCards[5]];

        newGame.players = [host, cardCzar, winner];
        newGame.stateMachine.jumpTo("showingCards");

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));
        newGame.currentRound.whiteCardsByPlayer = [
            createWhiteCardsByPlayer(winner.id, winner.whiteCards),
            createWhiteCardsByPlayer(host.id, host.whiteCards),
            createWhiteCardsByPlayer(cardCzar.id, cardCzar.whiteCards),
        ];
        const winningCards =
            newGame.currentRound.whiteCardsByPlayer[0].whiteCards.map(
                (card) => card.id
            );

        mockGetGame(newGame);

        await selectWinner(
            ioMock,
            socketMock,
            mockGameId,
            "cardCzar",
            [winningCards[0]],
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
    });

    it("Must send cards back, which are held by some player", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const whiteCards = createWhiteCards(6);

        const host = createPlayer("host", true);
        host.whiteCards = [whiteCards[2], whiteCards[3]];
        const cardCzar = createPlayer("cardCzar", false, true);
        cardCzar.whiteCards = [whiteCards[4], whiteCards[5]];

        newGame.players = [host, cardCzar];
        newGame.stateMachine.jumpTo("showingCards");

        newGame.currentRound = createRound("cardCzar", createBlackCard(2));
        newGame.currentRound.whiteCardsByPlayer = [
            createWhiteCardsByPlayer(host.id, host.whiteCards),
            createWhiteCardsByPlayer(cardCzar.id, cardCzar.whiteCards),
        ];
        const winningCards = [whiteCards[0].id, whiteCards[1].id];

        mockGetGame(newGame);

        await selectWinner(
            ioMock,
            socketMock,
            mockGameId,
            "cardCzar",
            winningCards,
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
    });
});

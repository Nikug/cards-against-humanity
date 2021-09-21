import {
    createBlackCards,
    createPlayer,
    createWhiteCards,
    ioMock,
    mockGameId,
    mockGetGame,
    mockPlayerId,
    mockSetGame,
    mockTransactionize,
} from "./helpers";

import { Game } from "types";
import { changeGameStateAfterTime } from "../modules/utilities/delayedStateChange";
import { createRound } from "../modules/rounds/roundUtil";
import { createWhiteCardsByPlayer } from "../modules/cards/cardUtil";
import { gameOptions } from "../consts/gameSettings";
import { newGameTemplate } from "../modules/games/newGame";

beforeAll(() => {
    jest.useFakeTimers();
    mockTransactionize();
});

afterAll(() => {
    jest.useRealTimers();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("Change Game State After Time", () => {
    it("handles change startPlayingWhiteCards", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const host = createPlayer("host", true);
        const cardCzar = createPlayer("cardCzar", false, true);
        const player = createPlayer(mockPlayerId);

        newGame.players = [host, cardCzar, player];
        newGame.stateMachine.jumpTo("pickingBlackCard");

        const newerGame = changeGameStateAfterTime(
            ioMock,
            newGame,
            "startPlayingWhiteCards"
        );
        mockGetGame(newerGame);
        jest.runOnlyPendingTimers();

        expect(await mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("pickingBlackCard");
        expect(game.players[1].score).toBe(
            -gameOptions.notSelectingWinnerPunishment
        );
        expect(game.players[0].state).toBe("waiting");
        expect(game.players[1].state).toBe("waiting");
        expect(game.players[2].state).toBe("playing");
    });

    it("handles change startReading when there are no played cards", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const host = createPlayer("host", true);
        const cardCzar = createPlayer("cardCzar", false, true);
        const player = createPlayer(mockPlayerId);

        newGame.players = [host, cardCzar, player];
        newGame.stateMachine.jumpTo("playingWhiteCards");

        const newerGame = changeGameStateAfterTime(
            ioMock,
            newGame,
            "startReading"
        );
        mockGetGame(newerGame);
        jest.runOnlyPendingTimers();

        expect(await mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("pickingBlackCard");
        expect(game.players[1].score).toBe(0);
        expect(game.players[0].state).toBe("waiting");
        expect(game.players[1].state).toBe("waiting");
        expect(game.players[2].state).toBe("playing");
    });

    it("handles change startReading when there are played cards", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const host = createPlayer("host", true);
        const cardCzar = createPlayer("cardCzar", false, true);
        const player = createPlayer(mockPlayerId);

        newGame.players = [host, cardCzar, player];
        newGame.stateMachine.jumpTo("playingWhiteCards");
        newGame.currentRound = createRound(
            1,
            createBlackCards(1)[0],
            cardCzar.id
        );
        newGame.currentRound.whiteCardsByPlayer = [
            createWhiteCardsByPlayer(createWhiteCards(2), host.id, host.name),
            createWhiteCardsByPlayer(
                createWhiteCards(2),
                player.id,
                player.name
            ),
        ];

        const newerGame = changeGameStateAfterTime(
            ioMock,
            newGame,
            "startReading"
        );
        mockGetGame(newerGame);
        jest.runOnlyPendingTimers();

        expect(await mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("readingCards");
        expect(game.currentRound?.cardIndex).toBe(0);
        expect(game.players.every((player) => player.state === "active")).toBe(
            true
        );
    });

    it("handles change showCards when there are cards to show", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const host = createPlayer("host", true);
        const cardCzar = createPlayer("cardCzar", false, true);
        const player = createPlayer(mockPlayerId);

        newGame.players = [host, cardCzar, player];
        newGame.stateMachine.jumpTo("readingCards");
        newGame.currentRound = createRound(
            1,
            createBlackCards(1)[0],
            cardCzar.id
        );
        newGame.currentRound.whiteCardsByPlayer = [
            createWhiteCardsByPlayer(createWhiteCards(2), host.id, host.name),
            createWhiteCardsByPlayer(
                createWhiteCards(2),
                player.id,
                player.name
            ),
        ];
        newGame.currentRound.cardIndex = 0;

        const newerGame = changeGameStateAfterTime(
            ioMock,
            newGame,
            "showCards"
        );
        mockGetGame(newerGame);
        jest.runOnlyPendingTimers();

        expect(await await mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("readingCards");
        expect(game.currentRound?.cardIndex).toBe(1);
        expect(game.players.every((player) => player.state === "active")).toBe(
            true
        );
    });

    it("handles change showCards when there are no more cards to show", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const host = createPlayer("host", true);
        const cardCzar = createPlayer("cardCzar", false, true);
        const player = createPlayer(mockPlayerId);

        newGame.players = [host, cardCzar, player];
        newGame.stateMachine.jumpTo("readingCards");
        newGame.currentRound = createRound(
            1,
            createBlackCards(1)[0],
            cardCzar.id
        );
        newGame.currentRound.whiteCardsByPlayer = [
            createWhiteCardsByPlayer(createWhiteCards(2), host.id, host.name),
            createWhiteCardsByPlayer(
                createWhiteCards(2),
                player.id,
                player.name
            ),
        ];
        newGame.currentRound.cardIndex = 2;

        const newerGame = changeGameStateAfterTime(
            ioMock,
            newGame,
            "showCards"
        );
        mockGetGame(newerGame);
        jest.runOnlyPendingTimers();

        expect(await await mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("showingCards");
        expect(game.currentRound?.cardIndex).toBe(2);
        expect(game.players.every((player) => player.state === "active")).toBe(
            true
        );
    });

    it("handles change endRound", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const host = createPlayer("host", true);
        const cardCzar = createPlayer("cardCzar", false, true);
        const player = createPlayer(mockPlayerId);

        newGame.players = [host, cardCzar, player];
        newGame.stateMachine.jumpTo("showingCards");
        newGame.currentRound = createRound(
            1,
            createBlackCards(1)[0],
            cardCzar.id
        );
        newGame.currentRound.whiteCardsByPlayer = [
            createWhiteCardsByPlayer(createWhiteCards(2), host.id, host.name),
            createWhiteCardsByPlayer(
                createWhiteCards(2),
                player.id,
                player.name
            ),
        ];

        const newerGame = changeGameStateAfterTime(ioMock, newGame, "endRound");
        mockGetGame(newerGame);
        jest.runOnlyPendingTimers();

        expect(await mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("roundEnd");
        expect(game.players.every((player) => player.state === "active")).toBe(
            true
        );
        expect(game.players[1].score).toBe(
            -gameOptions.notSelectingWinnerPunishment
        );
    });

    it("handles change startRound", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);

        const host = createPlayer("host", true);
        const cardCzar = createPlayer("cardCzar", false, true);
        const player = createPlayer(mockPlayerId);

        newGame.players = [host, cardCzar, player];
        newGame.stateMachine.jumpTo("roundEnd");

        const newerGame = changeGameStateAfterTime(
            ioMock,
            newGame,
            "startRound"
        );
        mockGetGame(newerGame);
        jest.runOnlyPendingTimers();

        expect(await await mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.stateMachine.state).toBe("pickingBlackCard");
        expect(game.players[0].state).toBe("waiting");
        expect(game.players[1].state).toBe("waiting");
        expect(game.players[2].state).toBe("playing");

        expect(game.players[2].isCardCzar).toBe(true);
        expect(game.players[1].isCardCzar).toBe(false);
    });
});

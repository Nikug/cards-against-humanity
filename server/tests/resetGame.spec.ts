import * as timeouts from "../modules/utilities/timeout";

import {
    createBlackCards,
    createPlayer,
    createWhiteCards,
    mockGameId,
} from "./helpers";

import { createRound } from "../modules/rounds/roundUtil";
import { newGameTemplate } from "../modules/games/newGame";
import { resetGame } from "../modules/games/endGame";

beforeAll(() => {
    jest.useFakeTimers();
});

afterAll(() => {
    jest.useRealTimers();
});

afterEach(() => {
    jest.clearAllMocks();
});

const mockRemoveTimeout = () => jest.spyOn(timeouts, "removeTimeout");

describe("Reset Game", () => {
    it("completely resets game", async () => {
        const newGame = newGameTemplate(mockGameId);

        const host = createPlayer("host", true);
        host.score = 0;
        host.whiteCards = createWhiteCards(10);
        const cardCzar = createPlayer("cardCzar", false, true);
        cardCzar.score = 1;
        cardCzar.whiteCards = createWhiteCards(10);
        cardCzar.popularVoteScore = 1;

        newGame.players = [host, cardCzar];
        newGame.stateMachine.jumpTo("playingWhiteCards");
        newGame.streak = { id: cardCzar.id, name: cardCzar.name, wins: 1 };

        newGame.cards = {
            whiteCards: createWhiteCards(20),
            blackCards: createBlackCards(10),
            sentBlackCards: [],
            playedWhiteCards: createWhiteCards(1),
            playedBlackCards: createBlackCards(1),
        };

        const blackCards = createBlackCards(5);
        const firstRound = createRound(1, blackCards[0], host.id);
        const secondRound = createRound(2, blackCards[1], cardCzar.id);

        newGame.currentRound = secondRound;
        newGame.client.rounds = [firstRound, secondRound];

        newGame.client.options.maximumPlayers = 5;
        newGame.client.options.cardPacks = [
            {
                id: "somePack",
                name: "somePack",
                isNsfw: true,
                whiteCards: 20,
                blackCards: 40,
            },
        ];

        newGame.client.timers.duration = 30;
        newGame.client.timers.passedTime = 10;
        newGame.timeout = setTimeout(() => null, 2000);

        const removeTimeoutMock = mockRemoveTimeout();
        const resettedGame = resetGame(newGame);

        const templateGame = newGameTemplate(mockGameId);
        templateGame.players = [
            createPlayer("host", true),
            createPlayer("cardCzar"),
        ];

        expect(removeTimeoutMock).toHaveBeenCalledTimes(1);
        expect(resettedGame.stateMachine.state).toBe("lobby");

        expect(
            resettedGame.players.every((player) => player.state === "active")
        ).toBe(true);
        expect(resettedGame.players.every((player) => player.score === 0)).toBe(
            true
        );
        expect(
            resettedGame.players.every((player) => !player.isPopularVoteKing)
        ).toBe(true);
        expect(
            resettedGame.players.every(
                (player) => player.popularVoteScore === 0
            )
        ).toBe(true);
        expect(
            resettedGame.players.every(
                (player) => player.whiteCards.length === 0
            )
        ).toBe(true);

        expect(resettedGame.cards).toEqual(templateGame.cards);
        expect(resettedGame.players).toEqual(templateGame.players);
        expect(resettedGame.streak).toBe(undefined);
        expect(resettedGame.currentRound).toBe(undefined);
        expect({ ...resettedGame.client, options: undefined }).toEqual({
            ...templateGame.client,
            options: undefined,
        });
        expect(resettedGame.timeout).toBe(undefined);

        // Don't reset options
        expect(resettedGame.client.options).toEqual(newGame.client.options);
    });
});

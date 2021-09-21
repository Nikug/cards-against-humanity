import { Game, Options } from "types";
import {
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
import { gameOptions } from "../consts/gameSettings";
import { newGameTemplate } from "../modules/games/newGame";
import { updateGameOptions } from "../modules/games/gameOptions";

beforeEach(() => {
    jest.clearAllMocks();
});

describe("Update Game Options", () => {
    it("Allows host to update game settings in lobby", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.players = [createPlayer("host", true)];
        mockGetGame(newGame);

        const newOptions: Options = {
            maximumPlayers: 5,
            winConditions: {
                scoreLimit: 4,
                useScoreLimit: true,
                roundLimit: 10,
                useRoundLimit: false,
            },
            winnerBecomesCardCzar: false,
            allowKickedPlayerJoin: true,
            allowCardCzarPopularVote: true,
            popularVote: true,
            cardPacks: [],
            loadingCardPacks: false,
            timers: {
                selectBlackCard: 30,
                useSelectBlackCard: true,
                selectWhiteCards: 60,
                useSelectWhiteCards: true,
                readBlackCard: 20,
                useReadBlackCard: true,
                selectWinner: 30,
                useSelectWinner: true,
                roundEnd: 20,
                useRoundEnd: true,
            },
        };

        await updateGameOptions(
            ioMock,
            socketMock,
            mockGameId,
            "host",
            newOptions,
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.client.options).toEqual(newOptions);
    });

    it("Allows host to update game settings in some other game state", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.stateMachine.startGame();
        newGame.stateMachine.startPlayingWhiteCards();
        newGame.stateMachine.startReading();
        newGame.client.state = newGame.stateMachine.state;
        newGame.players = [createPlayer("host", true)];
        mockGetGame(newGame);

        const newOptions: Options = {
            maximumPlayers: 5,
            winConditions: {
                scoreLimit: 4,
                useScoreLimit: true,
                roundLimit: 10,
                useRoundLimit: false,
            },
            winnerBecomesCardCzar: false,
            allowKickedPlayerJoin: true,
            allowCardCzarPopularVote: true,
            popularVote: true,
            cardPacks: [],
            loadingCardPacks: false,
            timers: {
                selectBlackCard: 30,
                useSelectBlackCard: true,
                selectWhiteCards: 60,
                useSelectWhiteCards: true,
                readBlackCard: 20,
                useReadBlackCard: true,
                selectWinner: 30,
                useSelectWinner: true,
                roundEnd: 20,
                useRoundEnd: true,
            },
        };

        await updateGameOptions(
            ioMock,
            socketMock,
            mockGameId,
            "host",
            newOptions,
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.client.options).toEqual(newOptions);
    });

    it("Doesn't allow anyone not-host to update game options", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.players = [
            createPlayer("host", true),
            createPlayer("not-host", false, true),
        ];
        mockGetGame(newGame);

        const newOptions: Options = {
            maximumPlayers: 5,
            winConditions: {
                scoreLimit: 4,
                useScoreLimit: true,
                roundLimit: 10,
                useRoundLimit: false,
            },
            winnerBecomesCardCzar: false,
            allowKickedPlayerJoin: true,
            allowCardCzarPopularVote: true,
            popularVote: true,
            cardPacks: [],
            loadingCardPacks: false,
            timers: {
                selectBlackCard: 30,
                useSelectBlackCard: true,
                selectWhiteCards: 60,
                useSelectWhiteCards: true,
                readBlackCard: 20,
                useReadBlackCard: true,
                selectWinner: 30,
                useSelectWinner: true,
                roundEnd: 20,
                useRoundEnd: true,
            },
        };

        const notificationMock = mockSendNotification();

        await updateGameOptions(
            ioMock,
            socketMock,
            mockGameId,
            "not-host",
            newOptions,
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(notificationMock).toHaveBeenCalledWith(
            ERROR_TYPES.forbiddenHostAction,
            expect.anything(),
            expect.anything()
        );
    });

    // TODO: Refactor options validation so this this test will pass
    it.skip("Doesn't allow updating game options with incorrect options", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.players = [createPlayer("host", true)];
        mockGetGame(newGame);

        const newOptions = {
            maximumPlayers: [], // Incorrect type
            winConditions: {
                scoreLimit: "aaa", // Incorrect type
                useScoreLimit: true,
                roundLimit: 10,
                useRoundLimit: false,
            },
            someFieldThatShouldNotExist: true, // Should not exist
            winnerBecomesCardCzar: false,
            // allowKickedPlayerJoin: true,
            // allowCardCzarPopularVote: true,
            popularVote: true,
            cardPacks: [],
            loadingCardPacks: false,
            timers: {
                selectBlackCard: 30,
                useSelectBlackCard: true,
                selectWhiteCards: 60,
                useSelectWhiteCards: true,
                readBlackCard: 20,
                useReadBlackCard: true,
                selectWinner: 30,
                useSelectWinner: true,
                roundEnd: 20,
                useRoundEnd: true,
            },
        } as unknown as Options;

        const notificationMock = mockSendNotification();

        await updateGameOptions(
            ioMock,
            socketMock,
            mockGameId,
            "host",
            newOptions,
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(0);
        expect(notificationMock).toHaveBeenCalledWith(
            ERROR_TYPES.otherError,
            expect.anything(),
            expect.anything()
        );
    });

    it("Clamps too large or too small values into acceptable values", async () => {
        const mockSet = mockSetGame();
        const newGame = newGameTemplate(mockGameId);
        newGame.players = [createPlayer("host", true)];
        mockGetGame(newGame);

        const newOptions: Options = {
            maximumPlayers: 500,
            winConditions: {
                scoreLimit: -40,
                useScoreLimit: true,
                roundLimit: 1000,
                useRoundLimit: false,
            },
            winnerBecomesCardCzar: false,
            allowKickedPlayerJoin: true,
            allowCardCzarPopularVote: true,
            popularVote: true,
            cardPacks: [],
            loadingCardPacks: false,
            timers: {
                selectBlackCard: 3000,
                useSelectBlackCard: true,
                selectWhiteCards: -60,
                useSelectWhiteCards: true,
                readBlackCard: 2000,
                useReadBlackCard: true,
                selectWinner: 3000,
                useSelectWinner: true,
                roundEnd: -200000,
                useRoundEnd: true,
            },
        };

        const expectedOptions: Options = {
            maximumPlayers: gameOptions.maximumPlayers,
            winConditions: {
                scoreLimit: gameOptions.winConditions.scoreLimit.minimum,
                useScoreLimit: true,
                roundLimit: gameOptions.winConditions.roundLimit.maximum,
                useRoundLimit: false,
            },
            winnerBecomesCardCzar: false,
            allowKickedPlayerJoin: true,
            allowCardCzarPopularVote: true,
            popularVote: true,
            cardPacks: [],
            loadingCardPacks: false,
            timers: {
                selectBlackCard: gameOptions.timers.selectBlackCard.maximum,
                useSelectBlackCard: true,
                selectWhiteCards: gameOptions.timers.selectWhiteCards.minimum,
                useSelectWhiteCards: true,
                readBlackCard: gameOptions.timers.readBlackCard.maximum,
                useReadBlackCard: true,
                selectWinner: gameOptions.timers.selectWinner.maximum,
                useSelectWinner: true,
                roundEnd: gameOptions.timers.roundEnd.minimum,
                useRoundEnd: true,
            },
        };

        await updateGameOptions(
            ioMock,
            socketMock,
            mockGameId,
            "host",
            newOptions,
            pgClientMock
        );

        expect(mockSet).toHaveBeenCalledTimes(1);
        const game: Game = await mockSet.mock.results[0].value;
        expect(game.client.options).toEqual(expectedOptions);
    });

    // TODO: After refactor, add test for updating options partially
});

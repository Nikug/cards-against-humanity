"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GAME_NAME_GENERATOR_MAX_RUNS = exports.INACTIVE_GAME_DELETE_TIME = exports.Password = exports.playerName = exports.gameOptions = void 0;
exports.gameOptions = {
    minimumPlayers: 2,
    maximumPlayers: 50,
    spectatorLimit: 20,
    defaultPlayers: 8,
    allowPopularVote: true,
    // If no one has votes, no point in making anyone king
    // Required minimum score is thus at least 1
    defaultScoreForShowingPopularVoteLeader: 1,
    defaultWinnerBecomesCardCzar: false,
    defaultAllowKickedPlayerJoin: true,
    defaultAllowCardCzarPopularVote: true,
    startingWhiteCardCount: 10,
    blackCardsToChooseFrom: 3,
    notSelectingWinnerPunishment: 1,
    winConditions: {
        scoreLimit: {
            minimum: 1,
            maximum: 100,
            default: 5,
            use: true,
        },
        roundLimit: {
            minimum: 1,
            maximum: 100,
            default: 5,
            use: false,
        },
    },
    timers: {
        selectBlackCard: {
            minimum: 5,
            default: 20,
            maximum: 10 * 60,
            use: true,
        },
        selectWhiteCards: {
            minimum: 5,
            default: 60,
            maximum: 10 * 60,
            use: true,
        },
        readBlackCard: {
            minimum: 5,
            default: 30,
            maximum: 10 * 60,
            use: true,
        },
        selectWinner: {
            minimum: 5,
            default: 30,
            maximum: 10 * 60,
            use: true,
        },
        roundEnd: {
            minimum: 5,
            default: 10,
            maximum: 10 * 60,
            use: true,
        },
    },
    defaultGracePeriod: 1,
};
exports.playerName = {
    minimumLength: 1,
    maximumLength: 50,
};
exports.Password = {
    maximumLength: 50,
};
// export const INACTIVE_GAME_DELETE_TIME = 10 * 60 * 1000; // 10 mins
exports.INACTIVE_GAME_DELETE_TIME = 5 * 60 * 1000; // 5 mins
exports.GAME_NAME_GENERATOR_MAX_RUNS = 100;

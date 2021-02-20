export const gameOptions = {
    minimunPlayers: 1,
    maximumPlayers: 50,
    defaultPlayers: 8,

    minimumScoreLimit: 1,
    maximumScoreLimit: 100,
    defaultScoreLimit: 1,

    // If no one has votes, no point in making anyone king
    // Required minimum score is thus at least 1
    defaultScoreForShowingPopularVoteLeader: 1,

    defaultWinnerBecomesCardCzar: false,
    defaultAllowKickedPlayerJoin: true,
    defaultAllowCardCzarPopularVote: true,

    startingWhiteCardCount: 10,
    blackCardsToChooseFrom: 3,

    notSelectingWinnerPunishment: 1,

    timers: {
        selectBlackCard: {
            minimum: 5,
            default: 20,
            maximum: 10 * 60,
        },
        selectWhiteCards: {
            minimum: 5,
            default: 60,
            maximum: 10 * 60,
        },
        readBlackCard: {
            minimum: 5,
            default: 30,
            maximum: 10 * 60,
        },
        selectWinner: {
            minimum: 5,
            default: 30,
            maximum: 10 * 60,
        },
        roundEnd: {
            minimum: 5,
            default: 10,
            maximum: 10 * 60,
        },
    },

    defaultGracePeriod: 1,
};

export const playerName = {
    minimumLength: 1,
    maximumLength: 50,
};

export const INACTIVE_GAME_DELETE_TIME = 10 * 60 * 1000; // 10 mins

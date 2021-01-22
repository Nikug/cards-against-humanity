export const gameOptions = {
    minimunPlayers: 1,
    maximumPlayers: 50,
    defaultPlayers: 8,

    minimumScoreLimit: 1,
    maximumScoreLimit: 100,
    defaultScoreLimit: 5,

    // If no one has votes, no point in making anyone king
    // Required minimum score is thus at least 1
    defaultScoreForShowingPopularVoteLeader: 1,

    defaultWinnerBecomesCardCzar: false,
    defaultAllowKickedPlayerJoin: true,
    defaultAllowCardCzarPopularVote: true,

    startingWhiteCardCount: 10,
    blackCardsToChooseFrom: 3,

    selectWhiteCardTimeLimit: 10,
    selectBlackCardTimeLimit: 30,

    defaultGracePeriod: 3,
};

export const playerName = {
    minimumLength: 1,
    maximumLength: 50,
};

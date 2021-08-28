export const gameSelector = (state) => state.game.value;
export const gameIdSelector = (state) => state.game.value?.id;
export const gameStateSelector = (state) => state.game.value?.state;
export const gamePickLimitSelector = (state) => {
    const rounds = state.game.value?.rounds;

    return rounds ? rounds[rounds.length - 1].blackCard.whiteCardsToPlay : 1;
};
export const gameBlackCardSelector = (state) => {
    const rounds = state.game.value?.rounds;

    return rounds[rounds.length - 1].blackCard;
};
export const gameWhiteCardsByPlayerSelector = (state) => {
    const rounds = state.game.value?.rounds;

    return rounds[rounds.length - 1].whiteCardsByPlayer;
};
export const gameTextToSpeechSelector = (state) => state.game.value?.players?.filter((player) => player.isCardCzar)[0].useTextToSpeech;
export const gameRoundNumberSelector = (state) => state.game.value?.rounds?.length || 0;
export const gameStreakSelector = (state) => state.game.value?.streak;
export const gameRoundsSelector = (state) => state.game.value?.rounds;
export const gameTimersSelector = (state) => state.game.value?.timers;

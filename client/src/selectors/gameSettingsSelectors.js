export const gameSettingsSelector = (state) => state.gameSettings.value;
export const gameSettingsPopularVoteSelector = (state) => state.gameSettings.value?.popularVote;
export const gameSettingsRoundLimitSelector = (state) => state.gameSettings.value?.winConditions?.roundLimit;
export const gameSettingsUseRoundLimitSelector = (state) => state.gameSettings.value?.winConditions?.useRoundLimit;

export const gameSettingsSelector = (state) => state.gameSettings.value;
export const gameSettingsRoundLimitSelector = (state) => state.gameSettings.value?.winConditions?.roundLimit;
export const gameSettingsUseRoundLimitSelector = (state) => state.gameSettings.value?.winConditions?.useRoundLimit;

export const playerSelector = (state) => state.player.value;
export const playerIdSelector = (state) => state.player.value?.id;
export const playerIsHostSelector = (state) => state.player.value?.isHost;

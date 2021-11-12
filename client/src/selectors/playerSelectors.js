import { isPlayerJoining, isPlayerSpectator } from '../helpers/player-helpers';

export const playerSelector = (state) => state.player.value;
export const playerIdSelector = (state) => state.player.value?.id;
export const playerIsHostSelector = (state) => state.player.value?.isHost;
export const playerIsSpectatorSelector = (state) => isPlayerSpectator(state.player.value);
export const playerIsCardCzarSelector = (state) => state.player.value?.isCardCzar;
export const playerIsJoiningSelector = (state) => isPlayerJoining(state.player.value?.state);
export const playerWhiteCardsSelector = (state) => state.player.value?.whiteCards;
export const playerStateSelector = (state) => state.player.value?.state;

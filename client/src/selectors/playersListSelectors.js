import { getCardCzarNameFromPlayersList } from '../helpers/getCardCzarNameFromPlayersList';
import { isPlayerSpectator } from '../helpers/player-helpers';

export const playersListSelector = (state) => state.players.value;
export const playersListSpectatorsSelector = (state) => state.players.value?.filter((player) => isPlayerSpectator(player));
export const playersListCardCzarNameSelector = (state) => getCardCzarNameFromPlayersList(state.players.value);

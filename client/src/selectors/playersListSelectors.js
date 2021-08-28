import { getCardCzarNameFromPlayersList } from '../helpers/getCardCzarNameFromPlayersList';

export const playersListSelector = (state) => state.players.value;
export const playersListCardCzarNameSelector = (state) => getCardCzarNameFromPlayersList(state.players.value);

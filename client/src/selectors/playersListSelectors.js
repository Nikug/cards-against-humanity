import { getCardCzarNameFromPlayersList } from '../helpers/getCardCzarNameFromPlayersList';
import { isPlayerSpectator } from '../helpers/player-helpers';

export const playersListSelector = (state) => state.players.value;
export const playersListSpectatorsSelector = (state) => state.players.value?.filter((player) => isPlayerSpectator(player));
export const playersListCardCzarNameSelector = (state) => getCardCzarNameFromPlayersList(state.players.value);
export const playersListTextToSpeechSelector = (state) => {
    const players = state.players.value || [];

    if (players.length === 0) {
        console.log('gameTextToSpeechSelector no players');
        return false;
    }

    const cardCzars = players.filter((player) => player.isCardCzar);

    if (cardCzars.length !== 1) {
        console.log('gameTextToSpeechSelector no cardCzar');
        return false;
    }

    console.log('gameTextToSpeechSelector', { cardCzars });
    return cardCzars[0].useTextToSpeech;
};

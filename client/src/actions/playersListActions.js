import { createActionWithPrefix } from './helpers/createActionWithPrefix';

const PLAYERS_LIST_PREFIX = 'PLAYERS_LIST';

export const playersListActionTypes = {
    UPDATE: createActionWithPrefix(PLAYERS_LIST_PREFIX, 'UPDATE'),
    RESET: createActionWithPrefix(PLAYERS_LIST_PREFIX, 'RESET'),
};

export function updatePlayersList(playersList) {
    return {
        type: playersListActionTypes.UPDATE,
        payload: playersList,
    };
}

export function resetPlayersList() {
    return {
        type: playersListActionTypes.RESET,
        payload: null,
    };
}

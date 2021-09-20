import { createActionWithPrefix } from './helpers/createActionWithPrefix';

const PLAYER_PREFIX = 'PLAYER';

export const playerActionTypes = {
    UPDATE: createActionWithPrefix(PLAYER_PREFIX, 'UPDATE'),
    RESET: createActionWithPrefix(PLAYER_PREFIX, 'RESET'),
};

export function updatePlayer(player) {
    return {
        type: playerActionTypes.UPDATE,
        payload: player,
    };
}

export function resetPlayer() {
    return {
        type: playerActionTypes.RESET,
        payload: null,
    };
}

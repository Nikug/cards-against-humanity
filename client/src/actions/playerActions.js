import { createActionWithPrefix } from './helpers/createActionWithPrefix';

const PLAYER_PREFIX = 'PLAYER';

export const playerActionTypes = {
    UPDATE: createActionWithPrefix(PLAYER_PREFIX, 'UPDATE'),
};

export function updatePlayer(player) {
    return {
        type: playerActionTypes.UPDATE,
        payload: player,
    };
}

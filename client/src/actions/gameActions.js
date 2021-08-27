import { createActionWithPrefix } from './helpers/createActionWithPrefix';

const GAME_PREFIX = 'GAME';

export const gameActionTypes = {
    UPDATE: createActionWithPrefix(GAME_PREFIX, 'UPDATE'),
};

export function updateGame(game) {
    return {
        type: gameActionTypes.UPDATE,
        payload: game,
    };
}

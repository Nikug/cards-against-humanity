import { createActionWithPrefix } from './helpers/createActionWithPrefix';

const GAME_PREFIX = 'GAME';

export const gameActionTypes = {
    UPDATE: createActionWithPrefix(GAME_PREFIX, 'UPDATE'),
    UPDATE_TIMERS: createActionWithPrefix(GAME_PREFIX, 'UPDATE_TIMERS'),
    RESET: createActionWithPrefix(GAME_PREFIX, 'RESET'),
};

export function updateGame(game) {
    return {
        type: gameActionTypes.UPDATE,
        payload: game,
    };
}

export function updateGameTimers(timers) {
    return {
        type: gameActionTypes.UPDATE_TIMERS,
        payload: timers,
    };
}

export function resetGame() {
    return {
        type: gameActionTypes.RESET,
        payload: null,
    };
}

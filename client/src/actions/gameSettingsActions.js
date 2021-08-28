import { createActionWithPrefix } from './helpers/createActionWithPrefix';

const GAME_SETTINGS_PREFIX = 'GAME_SETTINGS';

export const gameSettingsActionTypes = {
    UPDATE: createActionWithPrefix(GAME_SETTINGS_PREFIX, 'UPDATE'),
    RESET: createActionWithPrefix(GAME_SETTINGS_PREFIX, 'RESET'),
};

export function updateGameSettings(gameSettings) {
    return {
        type: gameSettingsActionTypes.UPDATE,
        payload: gameSettings,
    };
}

export function resetGameSettings() {
    return {
        type: gameSettingsActionTypes.RESET,
        payload: null,
    };
}

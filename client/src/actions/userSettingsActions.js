import { createActionWithPrefix } from './helpers/createActionWithPrefix';

const USER_SETTINGS_PREFIX = 'USER_SETTINGS';

export const userSettingsActionTypes = {
    UPDATE: createActionWithPrefix(USER_SETTINGS_PREFIX, 'UPDATE'),
    RESET: createActionWithPrefix(USER_SETTINGS_PREFIX, 'RESET'),
};

export function updateUserSettings(userSettings) {
    return {
        type: userSettingsActionTypes.UPDATE,
        payload: userSettings,
    };
}

export function resetUserSettings() {
    return {
        type: userSettingsActionTypes.RESET,
        payload: null,
    };
}

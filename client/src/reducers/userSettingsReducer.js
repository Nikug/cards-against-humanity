import { userSettingsActionTypes } from '../actions/userSettingsActions';
import { getJsonFromLocalStorage, LOCAL_STORAGE_FIELDS, setJsonToLocalStorage } from '../helpers/localstoragehelpers';

export const getInitialUserSettingsState = () => {
    const settings = getJsonFromLocalStorage(LOCAL_STORAGE_FIELDS.USER_SETTINGS) || {};

    return { value: settings, state: null };
};

const userSettingsReducer = (state = getInitialUserSettingsState(), action) => {
    switch (action.type) {
        case userSettingsActionTypes.UPDATE:
            state = {
                ...state,
                value: { ...state.value, ...action.payload },
            };
            break;
        case userSettingsActionTypes.RESET:
            state = getInitialUserSettingsState();
            break;
        default:
            break;
    }

    setJsonToLocalStorage(LOCAL_STORAGE_FIELDS.USER_SETTINGS, state.value);

    return state;
};

export default userSettingsReducer;

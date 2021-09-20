import { userSettingsActionTypes } from '../actions/userSettingsActions';

export const getInitialUserSettingsState = () => {
    return { value: {}, state: null };
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
    return state;
};

export default userSettingsReducer;

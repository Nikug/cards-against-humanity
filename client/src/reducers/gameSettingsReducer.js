import { gameSettingsActionTypes } from '../actions/gameSettingsActions';

export const getInitialGameSettingsState = () => {
    return { value: {}, state: null };
};

const gameSettingsReducer = (state = getInitialGameSettingsState(), action) => {
    switch (action.type) {
        case gameSettingsActionTypes.UPDATE:
            state = {
                ...state,
                value: { ...action.payload },
            };
            break;
        case gameSettingsActionTypes.RESET:
            state = getInitialGameSettingsState();
            break;
    }
    return state;
};

export default gameSettingsReducer;

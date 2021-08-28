import { gameActionTypes } from '../actions/gameActions';

export const getInitialGameState = () => {
    return { value: {}, state: null };
};

const gameReducer = (state = getInitialGameState(), action) => {
    switch (action.type) {
        case gameActionTypes.UPDATE:
            state = {
                ...state,
                value: { ...action.payload },
            };
            break;
        case gameActionTypes.UPDATE_TIMERS:
            state = {
                ...state,
                value: { timers: { ...action.payload } },
            };
            break;
        case gameActionTypes.RESET:
            state = getInitialGameState();
            break;
        default:
            break;
    }
    return state;
};

export default gameReducer;

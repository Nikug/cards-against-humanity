import { playerActionTypes } from '../actions/playerActions';

export const getInitialPlayerState = () => {
    return { value: {}, state: null };
};

const playerReducer = (state = getInitialPlayerState(), action) => {
    switch (action.type) {
        case playerActionTypes.UPDATE:
            state = {
                ...state,
                value: { ...action.payload },
            };
            break;
        case playerActionTypes.RESET:
            state = getInitialPlayerState();
            break;
    }
    return state;
};

export default playerReducer;

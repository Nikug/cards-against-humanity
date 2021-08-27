import { playerActionTypes } from '../actions/playerActions';

const playerReducer = (state = { value: {}, state: null }, action) => {
    switch (action.type) {
        case playerActionTypes.UPDATE:
            state = {
                ...state,
                value: { ...action.payload },
            };
            break;
    }
    return state;
};

export default playerReducer;

import { gameActionTypes } from '../actions/gameActions';

const gameReducer = (state = { value: {}, state: null }, action) => {
    switch (action.type) {
        case gameActionTypes.UPDATE:
            state = {
                ...state,
                value: { ...action.payload },
            };
            break;
    }
    return state;
};

export default gameReducer;

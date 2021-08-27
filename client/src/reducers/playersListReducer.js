import { playersListActionTypes } from '../actions/playersListActions';

const playersListReducer = (state = { value: [], state: null }, action) => {
    switch (action.type) {
        case playersListActionTypes.UPDATE:
            state = {
                ...state,
                value: [...action.payload],
            };
            break;
    }
    return state;
};

export default playersListReducer;

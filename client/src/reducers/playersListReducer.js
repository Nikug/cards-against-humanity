import { playersListActionTypes } from '../actions/playersListActions';

export const getInitialPlayersListState = () => {
    return { value: [], state: null };
};

const playersListReducer = (state = getInitialPlayersListState(), action) => {
    switch (action.type) {
        case playersListActionTypes.UPDATE:
            state = {
                ...state,
                value: [...action.payload],
            };
            break;
        case playersListActionTypes.RESET:
            state = getInitialPlayersListState();
            break;
    }
    return state;
};

export default playersListReducer;

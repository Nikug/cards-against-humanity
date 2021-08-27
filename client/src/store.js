import { createStore, combineReducers, applyMiddleware } from 'redux';
import logger from 'redux-logger';

import player from './reducers/playerReducer';
import game from './reducers/gameReducer';
import players from './reducers/playersListReducer';

export default createStore(
    combineReducers({
        player,
        game,
        players,
    }),
    {},
    applyMiddleware(logger)
);

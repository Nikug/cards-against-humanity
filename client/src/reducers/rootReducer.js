import { combineReducers } from 'redux';
import player from './playerReducer';
import game from './gameReducer';
import gameSettings from './gameSettingsReducer';
import players from './playersListReducer';
import userSettings from './userSettingsReducer';

const rootReducer = combineReducers({
    player,
    game,
    gameSettings,
    players,
    userSettings,
});

export default rootReducer;

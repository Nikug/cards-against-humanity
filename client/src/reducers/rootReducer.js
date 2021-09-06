import { combineReducers } from 'redux';
import player from './playerReducer';
import game from './gameReducer';
import gameSettings from './gameSettingsReducer';
import players from './playersListReducer';

const rootReducer = combineReducers({
    player,
    game,
    gameSettings,
    players,
});

export default rootReducer;

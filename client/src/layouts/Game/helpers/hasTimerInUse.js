import { GAME_STATES } from '../../../consts/gamestates';
import { isNullOrUndefined } from '../../../helpers/generalhelpers';

export const hasTimerInUse = (gameState, timers) => {
    if (isNullOrUndefined(gameState) || isNullOrUndefined(timers)) {
        return false;
    }

    switch (gameState) {
        case GAME_STATES.LOBBY:
            return false;
        case GAME_STATES.PICKING_BLACK_CARD:
            return timers.useSelectBlackCard;
        case GAME_STATES.PLAYING_WHITE_CARDS:
            return timers.useSelectWhiteCards;
        case GAME_STATES.READING_CARDS:
            return timers.useReadBlackCard;
        case GAME_STATES.SHOWING_CARDS:
            return timers.useSelectWinner;
        case GAME_STATES.ROUND_END:
            return timers.useRoundEnd;
        case GAME_STATES.GAME_OVER:
            return false;
        default:
            return false;
    }
};

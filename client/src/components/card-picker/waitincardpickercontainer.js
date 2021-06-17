import { CardPicker } from './cardpicker';
import { GAME_STATES } from '../../consts/gamestates';
import React from 'react';
import { emptyFn } from '../../helpers/generalhelpers';
import { isPlayerSpectatorOrJoining } from '../../helpers/player-helpers';
import { translateCommon } from '../../helpers/translation-helpers';
import { useTranslation } from 'react-i18next';
import { useGameContext } from '../../contexts/GameContext';

export function WaitingCardPickerContainer({ alternativeText, showMainCard, noBigMainCard }) {
    const { t } = useTranslation();
    const { game, player } = useGameContext();
    const gameState = game?.state;

    const isSpectator = isPlayerSpectatorOrJoining(player);
    let whiteCards;

    if (isSpectator) {
        whiteCards = [];
    } else {
        whiteCards = gameState === GAME_STATES.SHOWING_CARDS ? game.rounds[game.rounds.length - 1].whiteCardsByPlayer : player?.whiteCards;
    }

    let mainCard = null;

    if (showMainCard !== false) {
        mainCard = game?.rounds[game?.rounds?.length - 1].blackCard;
    }

    return (
        <div className="cardpicker-container waiting">
            <CardPicker
                alternativeText={alternativeText}
                mainCard={mainCard}
                selectableCards={whiteCards}
                selectedCards={[]}
                confirmedCards={[]}
                selectCard={emptyFn}
                confirmCards={emptyFn}
                description={isSpectator ? null : translateCommon('yourWhiteCards', t)}
                noActionButton={true}
                noBigMainCard={noBigMainCard}
            />
        </div>
    );
}

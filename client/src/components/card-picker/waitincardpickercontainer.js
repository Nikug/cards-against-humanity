import { CardPicker } from './cardpicker';
import { GAME_STATES } from '../../consts/gamestates';
import React from 'react';
import { emptyFn } from '../../helpers/generalhelpers';
import { isPlayerSpectatorOrJoining } from '../../helpers/player-helpers';
import { translateCommon } from '../../helpers/translation-helpers';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { gameBlackCardSelector, gameStateSelector, gameWhiteCardsByPlayerSelector } from '../../selectors/gameSelectors';
import { playerSelector, playerWhiteCardsSelector } from '../../selectors/playerSelectors';

export function WaitingCardPickerContainer({ alternativeText, showMainCard, noBigMainCard }) {
    const { t } = useTranslation();

    // State
    const player = useSelector(playerSelector);
    const blackCard = useSelector(gameBlackCardSelector);
    const gameState = useSelector(gameStateSelector);
    const whiteCardsByPlayer = useSelector(gameWhiteCardsByPlayerSelector);
    const ownWhiteCards = useSelector(playerWhiteCardsSelector);

    const isSpectator = isPlayerSpectatorOrJoining(player);
    const whiteCards = isSpectator ? [] : gameState === GAME_STATES.SHOWING_CARDS ? whiteCardsByPlayer : ownWhiteCards;
    const mainCard = showMainCard ? blackCard : null;

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

import React, { useState } from 'react';
import { socket } from '../sockets/socket';

import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { CardPicker } from './cardpicker';
import { containsObjectWithMatchingFieldIndex } from '../../helpers/generalhelpers';
import { translateCommon } from '../../helpers/translation-helpers';
import { playerIdSelector, playerWhiteCardsSelector } from '../../selectors/playerSelectors';
import { gameIdSelector, gamePickLimitSelector, gameBlackCardSelector } from '../../selectors/gameSelectors';

export function WhiteCardPickerContainer() {
    const { t } = useTranslation();

    // State
    const gameID = useSelector(gameIdSelector);
    const playerID = useSelector(playerIdSelector);
    const whiteCards = useSelector(playerWhiteCardsSelector);
    const pickLimit = useSelector(gamePickLimitSelector);
    const blackCard = useSelector(gameBlackCardSelector);

    const [selectedCards, setSelectedCards] = useState([]);
    const [confirmedCards, setConfirmedCards] = useState([]);

    const selectCard = (card) => {
        if (confirmedCards.length > 0) {
            return;
        }

        const newSelectedCards = selectedCards.slice();
        const i = containsObjectWithMatchingFieldIndex(card, newSelectedCards, 'id');

        if (i !== -1) {
            newSelectedCards.splice(i);
        } else if (newSelectedCards.length < pickLimit) {
            newSelectedCards.push(card);
        } else {
            newSelectedCards.pop();
            newSelectedCards.push(card);
        }

        setSelectedCards(newSelectedCards);
    };

    const confirmCard = () => {
        if (selectedCards.length === pickLimit) {
            socket.emit('play_white_cards', {
                gameID,
                playerID,
                whiteCardIDs: selectedCards.map((whiteCard) => whiteCard.id),
            });

            setConfirmedCards(selectedCards);
        } else {
            console.log('ERROR: There was not enough white cards to confirm');
        }
    };

    return (
        <div className="cardpicker-container">
            <CardPicker
                alternativeText={confirmedCards.length > 0 ? translateCommon('otherPlayersAreStillChoosingCards', t) : null}
                mainCard={blackCard}
                selectableCards={whiteCards}
                selectedCards={selectedCards}
                confirmedCards={confirmedCards}
                selectCard={selectCard}
                confirmCards={confirmCard}
                description={translateCommon('chooseWhiteCard', t)}
                selectDisabled={selectedCards.length !== pickLimit}
                noBigMainCard={false}
                showPreviewTitle={true}
            />
        </div>
    );
}

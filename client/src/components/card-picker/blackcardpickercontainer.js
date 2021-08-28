import React, { useState } from 'react';
import { containsObjectWithMatchingFieldIndex, emptyFn, isNullOrUndefined } from '../../helpers/generalhelpers';

import { CardPicker } from './cardpicker';
import { socket } from '../sockets/socket';
import { translateCommon } from '../../helpers/translation-helpers';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { gameIdSelector } from '../../selectors/gameSelectors';
import { playerIdSelector } from '../../selectors/playerSelectors';

export const BlackCardPickerContainer = ({ blackCards }) => {
    const { t } = useTranslation();

    // State
    const gameID = useSelector(gameIdSelector);
    const playerID = useSelector(playerIdSelector);
    const [selectedCards, setSelectedCards] = useState([]);
    const [confirmedCards, setConfirmedCards] = useState([]);

    const pickLimit = 1; // Always select just one black card

    const selectCard = (card) => {
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
            const cardID = selectedCards[0].id;

            socket.emit('select_black_card', {
                gameID: gameID,
                playerID: playerID,
                selectedCardID: cardID,
                discardedCardIDs: blackCards.filter((blackCard) => blackCard.id !== cardID).map((blackCard) => blackCard.id),
            });

            setConfirmedCards(selectedCards.slice());
        } else {
            console.log('Error: There was no black card to confirm');
        }
    };

    const cardsHaveBeenConfirmed = confirmedCards.length > 0;

    return (
        <div className="cardpicker-container">
            <CardPicker
                confirmCards={confirmCard}
                confirmedCards={confirmedCards}
                description={translateCommon('chooseBlackCard', t)}
                disableConfirmButton={cardsHaveBeenConfirmed || selectedCards.length !== pickLimit}
                noBigMainCard={true}
                pickingBlackCard={true}
                selectableCards={blackCards}
                selectCard={cardsHaveBeenConfirmed ? emptyFn : selectCard}
                selectedCards={selectedCards}
                showPreviewTitle={true}
            />
        </div>
    );
};

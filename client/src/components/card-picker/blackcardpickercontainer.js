import React, { useState } from 'react';
import { containsObjectWithMatchingFieldIndex, emptyFn, isNullOrUndefined } from '../../helpers/generalhelpers';

import { CardPicker } from './cardpicker';
import { socket } from '../sockets/socket';
import { translateCommon } from '../../helpers/translation-helpers';
import { useTranslation } from 'react-i18next';
import { useGameContext } from '../../contexts/GameContext';

export const BlackCardPickerContainer = ({ blackCards }) => {
    const { game, player } = useGameContext();
    const { t } = useTranslation();

    const [selectedCards, setSelectedCards] = useState([]);
    const [confirmedCards, setConfirmedCards] = useState([]);

    const selectCard = (card) => {
        const newSelectedCards = selectedCards.slice();
        let pickLimit = 1;

        if (isNullOrUndefined(card.whiteCardsToPlay)) {
            pickLimit = game.rounds[game.rounds.length - 1].blackCard.whiteCardsToPlay;
        }

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
        if (selectedCards.length === 1) {
            const cardID = selectedCards[0].id;
            const gameID = game?.id;
            const playerID = player?.id;

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
                disableConfirmButton={cardsHaveBeenConfirmed || selectedCards.length !== 1}
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

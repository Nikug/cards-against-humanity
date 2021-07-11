import React from 'react';
import { isNullOrUndefined } from '../../../helpers/generalhelpers';
import { Card } from '../card';

export const renderBlackCardwithWhiteCards = ({ blackCard, whiteCards, popularVoteScore, playerName, isBigCard, key }) => {
    let card = null;

    const blankTexts = [];
    let selectedWhiteCards = whiteCards.length > 0 ? whiteCards.slice() : [];

    // If selectedCard is actually multiple selected cards, convert to better format
    if (!isNullOrUndefined(selectedWhiteCards) && (selectedWhiteCards.length > 0) & Array.isArray(selectedWhiteCards[0]?.id)) {
        selectedWhiteCards = [];

        for (let i = 0, len = whiteCards.length; i < len; i++) {
            const card = whiteCards[i];

            for (let j = 0, len2 = card.id.length; j < len2; j++) {
                const newCard = {
                    id: card.id[j],
                    cardPackID: card.cardPackID[j],
                    text: card.text[j],
                };

                selectedWhiteCards.push(newCard);
            }
        }
    }

    for (let i = 0, len = selectedWhiteCards.length; i < len; i++) {
        const card = selectedWhiteCards[i];

        const lastChar = card.text.slice(card.text.length - 1, card.text.length);

        if (lastChar === '.') {
            blankTexts.push(card.text.slice(0, card.text.length - 1)); // Cut the extra dot.
        } else {
            blankTexts.push(card.text);
        }
    }

    card = (
        <Card
            card={blackCard}
            blankTexts={blankTexts}
            key={key || 'mainCard'}
            bigCard={isBigCard}
            popularVoteScore={popularVoteScore}
            playerName={playerName}
        />
    );
    return card;
};

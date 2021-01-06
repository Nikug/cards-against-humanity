import React, { useEffect, useState } from "react";
import { socket } from "../sockets/socket";

import Card from "./card";
import { getBlackCard, getWhiteCard } from "../../fakedata/fakecarddata";
import { containsObjectWithMatchingField } from "../../helpers/generalhelpers";
import Button, { BUTTON_TYPES } from "../button";

/**
 * Everything given via props
 * @param {mainCard} Card The basic card object which is displayed at the top.
 * @param {selectableCards} Array The cards that can be selected. Will be render at the bottom half.
 * @param {selectedCards} Array Which cards have been selected.
 * @param {confirmedCards} Array Which cards have been confirmed.
 * @param {selectCard} function Callback function to select a card. Calls the function with the card obj.
 * @param {confirmCards} function Callback function to confirm all selected cards.
 * @param {pickingBlackCard} boolean Is the picked card black.
 */

export function CardPicker(props) {
    const {
        mainCard,
        selectableCards,
        selectedCards,
        confirmedCards,
        selectCard,
        confirmCards,
        pickingBlackCard,
        description,
    } = props;
    const renderedCards = [];

    const selectableCardsLength = selectableCards ? selectableCards.length : 0;

    for (let i = 0; i < selectableCardsLength; i++) {
        const card = selectableCards[i];

        renderedCards.push(
            <Card
                key={i}
                card={card}
                selected={containsObjectWithMatchingField(
                    card,
                    selectedCards,
                    "id"
                )}
                confirmed={containsObjectWithMatchingField(
                    card,
                    confirmedCards,
                    "id"
                )}
                selectCard={selectCard}
            />
        );
    }

    return (
        <div className="cardpicker-wrapper">
            <div className="main">
                <span />
                {pickingBlackCard ? (
                    <Card
                        card={
                            selectedCards.length > 0
                                ? selectedCards[0]
                                : confirmedCards.length > 0
                                ? confirmedCards[0]
                                : { text: "", whiteCardsToPlay: 2 }
                        }
                    />
                ) : (
                    <Card card={mainCard} bigCard={true} blankTexts={[]} />
                )}
                <Button
                    additionalClassname="confirm-button"
                    text="Valitse"
                    callback={() => confirmCards()}
                    type={BUTTON_TYPES.PRIMARY}
                    icon="send"
                    iconPosition="after"
                >
                    aaaa
                </Button>
            </div>
            {description}
            <div className="selectable">{renderedCards}</div>
        </div>
    );
}

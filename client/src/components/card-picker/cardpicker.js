import React, { useEffect, useState } from "react";
import { socket } from "../sockets/socket";

import Card from "./card";
import { getBlackCard, getWhiteCard } from "../../fakedata/fakecarddata";
import { containsObjectWithMatchingField } from "../../helpers/generalhelpers";

/**
 * Everything given via props
 * @param {mainCard} Card The basic card object which is displayed at the top.
 * @param {selectableCards} Array The cards that can be selected. Will be render at the bottom half.
 * @param {selectedCards} Array Which cards have been selected.
 * @param {confirmedCards} Array Which cards have been confirmed.
 * @param {selectCard} function Callback function to select a card. Calls the function with the card obj.
 * @param {confirmCards} function Callback function to confirm all selected cards.
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
    } = props;
    const renderedCards = [];

    for (let i = 0, len = selectableCards.length; i < len; i++) {
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
            />
        );
    }

    return (
        <div className="cardpicker-wrapper">
            <div className="main">
                {pickingBlackCard ? (
                    <Card card={selectedCards[0]} />
                ) : (
                    <Card card={mainCard} bigCard={true} blankTexts={[]} />
                )}
            </div>
            <div className="selectable">{renderedCards}</div>
        </div>
    );
}

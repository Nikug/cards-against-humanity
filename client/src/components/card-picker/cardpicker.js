import React, { useEffect, useState } from "react";
import { socket } from "../sockets/socket";

import Card from "./card";
import { getBlackCard, getWhiteCard } from "../../fakedata/fakecarddata";
import {
    containsObjectWithMatchingField,
    isNullOrUndefined,
} from "../../helpers/generalhelpers";
import Button, { BUTTON_TYPES } from "../button";
import { CardPack } from "../game-settings/cardpack";

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
        alternativeText,
        disableConfirmButton,
        mainCard,
        selectableCards,
        selectedCards,
        confirmedCards,
        selectCard,
        confirmCards,
        pickingBlackCard,
        description,
        selectDisabled,
        customButtonTexts,
        customButtonIcons,
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

    const hasAlternativeText = !isNullOrUndefined(alternativeText);
    const mainContent = [];

    if (pickingBlackCard) {
        mainContent.push(
            <Card
                card={
                    selectedCards.length > 0
                        ? selectedCards[0]
                        : confirmedCards.length > 0
                        ? confirmedCards[0]
                        : {
                              text: "",
                              whiteCardsToPlay: 0,
                          }
                }
            />
        );
    } else {
        const content = [];

        if (mainCard) {
            const blankTexts = [];
            let selectedWhiteCards = selectedCards.slice();

            // If selectedCard is actually multiplse selected cards, convert to better format
            if (
                !isNullOrUndefined(selectedCards) &&
                (selectedCards.length > 0) & Array.isArray(selectedCards[0]?.id)
            ) {
                selectedWhiteCards = [];

                for (let i = 0, len = selectedCards.length; i < len; i++) {
                    const card = selectedCards[i];

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

            console.log({ selectedWhiteCards });
            for (let i = 0, len = selectedWhiteCards.length; i < len; i++) {
                const card = selectedWhiteCards[i];

                blankTexts.push(card.text.slice(0, card.text.length - 1)); // Cut the extra dot.
            }

            content.push(
                <Card card={mainCard} bigCard={true} blankTexts={blankTexts} />
            );
        }

        if (alternativeText) {
            content.push(
                <div className="alternativetext">
                    {alternativeText}
                    <i
                        className="fa fa-spinner fa-spin"
                        style={{ fontSize: "24px" }}
                    />
                </div>
            );
        }

        mainContent.push(<div>{content}</div>);
    }

    const cardsAreSelected = confirmedCards.length > 0;
    let buttonTexts = ["Valitse", "Valinta tehty"];
    let buttonIcons = ["send", "done"];

    if (!isNullOrUndefined(customButtonTexts) && customButtonTexts.length > 0) {
        for (let i = 0, len = buttonTexts.length; i < len; i++) {
            if (customButtonTexts.length - 1 < i) {
                break;
            }
            buttonTexts[i] = customButtonTexts[i];
        }
    }
    if (!isNullOrUndefined(customButtonIcons) && customButtonIcons.length > 0) {
        for (let i = 0, len = buttonIcons.length; i < len; i++) {
            if (customButtonIcons.length - 1 < i) {
                break;
            }
            buttonIcons[i] = customButtonIcons[i];
        }
        buttonIcons = customButtonIcons;
    }

    return (
        <div className="cardpicker-wrapper">
            <div className="main">
                <span />
                {mainContent}
                <Button
                    additionalClassname={`confirm-button ${
                        cardsAreSelected ? "non-selectable" : ""
                    } ${selectDisabled ? "disabled" : ""}`}
                    text={cardsAreSelected ? buttonTexts[1] : buttonTexts[0]}
                    callback={() => confirmCards()}
                    type={
                        cardsAreSelected
                            ? BUTTON_TYPES.GREEN
                            : BUTTON_TYPES.PRIMARY
                    }
                    icon={cardsAreSelected ? buttonIcons[1] : buttonIcons[0]}
                    iconPosition="after"
                    disabled={hasAlternativeText}
                />
            </div>
            <div className="description">{description}</div>
            <div
                className={`selectable ${
                    cardsAreSelected ? "non-selectable" : ""
                }`}
            >
                {renderedCards}
            </div>
        </div>
    );
}

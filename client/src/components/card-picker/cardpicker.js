import React from "react";

import Card from "./card";
import {
    containsObjectWithMatchingField,
    emptyFn,
    isNullOrUndefined,
} from "../../helpers/generalhelpers";
import Button, { BUTTON_TYPES } from "../button";
import { renderBlackCardwithWhiteCards } from "./cardformathelpers.js/renderBlackcardWithWhiteCards";

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
        selectableCards = [],
        selectedCards = [],
        confirmedCards = [],
        selectCard,
        confirmCards,
        pickingBlackCard,
        description,
        selectDisabled,
        customButtonTexts,
        customButtonIcons,
        customButtonState,
        noActionButton,
        topText,
        showPopularVote,
        noBigMainCard,
        givePopularVote,
        popularVotedCardsIDs,
        preRenderedCards = [],
    } = props;
    const renderedCards = preRenderedCards.slice();
    const selectableCardsLength = selectableCards ? selectableCards.length : 0;

    if (renderedCards.length === 0) {
        for (let i = 0; i < selectableCardsLength; i++) {
            const card = selectableCards[i];
            let hasBeenPopularVoted = false;

            if (popularVotedCardsIDs?.length > 0) {
                for (
                    let i = 0, len = popularVotedCardsIDs.length;
                    i < len;
                    i++
                ) {
                    const votedIDs = popularVotedCardsIDs[i];

                    if (votedIDs[0] === card.id[0]) {
                        hasBeenPopularVoted = true;
                        break;
                    }
                }
            }

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
                    showPopularVote={showPopularVote}
                    givePopularVote={givePopularVote}
                    hasBeenPopularVoted={hasBeenPopularVoted}
                />
            );
        }
    }

    const hasAlternativeText = !isNullOrUndefined(alternativeText);
    const mainContent = [];

    if (pickingBlackCard) {
        mainContent.push(
            <div className="content-wrapper" key="wrapper">
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
                    bigCard={!noBigMainCard}
                    key={"mainCard"}
                />
            </div>
        );
    } else {
        let selectedWhiteCards =
            selectedCards.length > 0
                ? selectedCards.slice()
                : confirmedCards.length > 0
                ? confirmedCards.slice()
                : [];
        const content = [];
        if (mainCard) {
            content.push(
                renderBlackCardwithWhiteCards({
                    blackCard: mainCard,
                    whiteCards: selectedWhiteCards,
                    isBigCard: !noBigMainCard,
                })
            );
        }

        if (alternativeText) {
            content.push(
                <div className="alternativetext" key="alternativeText">
                    {alternativeText}
                    <i
                        className="fa fa-spinner fa-spin"
                        style={{ fontSize: "24px" }}
                    />
                </div>
            );
        }

        mainContent.push(
            <div key="content" className="content-wrapper">
                {content}
            </div>
        );
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
            {topText && <div className="toptext">{topText}</div>}
            <div className="main">
                <span />
                {mainContent}
                {noActionButton !== true && (
                    <Button
                        additionalClassname={`confirm-button ${
                            (
                                !isNullOrUndefined(customButtonState)
                                    ? customButtonState === 1
                                    : cardsAreSelected
                            )
                                ? "non-selectable"
                                : ""
                        } ${selectDisabled ? "disabled" : ""}`}
                        text={
                            !isNullOrUndefined(customButtonState)
                                ? buttonTexts[customButtonState]
                                : cardsAreSelected
                                ? buttonTexts[1]
                                : buttonTexts[0]
                        }
                        callback={() => confirmCards()}
                        type={
                            !isNullOrUndefined(customButtonState)
                                ? customButtonState === 0
                                    ? BUTTON_TYPES.PRIMARY
                                    : BUTTON_TYPES.GREEN
                                : cardsAreSelected
                                ? BUTTON_TYPES.GREEN
                                : BUTTON_TYPES.PRIMARY
                        }
                        icon={
                            !isNullOrUndefined(customButtonState)
                                ? buttonIcons[customButtonState]
                                : cardsAreSelected
                                ? buttonIcons[1]
                                : buttonIcons[0]
                        }
                        iconPosition="after"
                        disabled={
                            !isNullOrUndefined(customButtonState)
                                ? customButtonState === 1
                                : hasAlternativeText || disableConfirmButton
                        }
                    />
                )}
            </div>
            <div className="description">{description}</div>
            <div
                className={`selectable ${
                    cardsAreSelected || selectCard === emptyFn
                        ? "non-selectable"
                        : ""
                }`}
            >
                {renderedCards}
            </div>
        </div>
    );
}

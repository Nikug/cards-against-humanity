import { BUTTON_TYPES, Button } from '../general/Button';
import { containsObjectWithMatchingField, emptyFn, isNullOrUndefined } from '../../helpers/generalhelpers';

import Card from './card';
import React from 'react';
import { isPlayerJoining } from '../../helpers/player-helpers';
import { renderBlackCardwithWhiteCards } from './cardformathelpers/renderBlackcardWithWhiteCards';
import { translateCommon } from '../../helpers/translation-helpers';
import { useGameContext } from '../../contexts/GameContext';
import { useTranslation } from 'react-i18next';

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
        centerActionButton,
        confirmCards,
        confirmedCards = [],
        customButtonIcons,
        customButtonState,
        customButtonTexts,
        description,
        disableConfirmButton,
        givePopularVote,
        isForInstructions,
        mainCard,
        noActionButton,
        noBigMainCard,
        pickingBlackCard,
        popularVotedCardsIDs,
        preRenderedCards = [],
        selectableCards = [],
        selectCard,
        selectDisabled,
        selectedCards = [],
        showPopularVote,
        topText,
    } = props;
    const { t } = useTranslation();
    const { player } = useGameContext();

    const renderedCards = preRenderedCards.slice();
    const selectableCardsLength = selectableCards ? selectableCards.length : 0;

    if (renderedCards.length === 0) {
        for (let i = 0; i < selectableCardsLength; i++) {
            const card = selectableCards[i];
            let hasBeenPopularVoted = false;

            if (popularVotedCardsIDs?.length > 0) {
                for (let i = 0, len = popularVotedCardsIDs.length; i < len; i++) {
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
                    selected={containsObjectWithMatchingField(card, selectedCards, 'id')}
                    confirmed={containsObjectWithMatchingField(card, confirmedCards, 'id')}
                    selectCard={selectCard}
                    showPopularVote={showPopularVote && !card.isOwn}
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
                                  text: '',
                                  whiteCardsToPlay: 0,
                              }
                    }
                    bigCard={!noBigMainCard}
                    key={'mainCard'}
                />
            </div>
        );
    } else {
        let selectedWhiteCards = selectedCards.length > 0 ? selectedCards.slice() : confirmedCards.length > 0 ? confirmedCards.slice() : [];
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
                    <i className="fa fa-spinner fa-spin" style={{ fontSize: '24px' }} />
                </div>
            );
        }
        if (isPlayerJoining(player)) {
            content.push(
                <div className="alternativetext" key="joining-text">
                    {translateCommon('youGetToPlayOnNextRound', t)}!
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
    let buttonTexts = [translateCommon('choose', t), translateCommon('cardChosen', t)];
    let buttonIcons = ['send', 'done'];

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
        <div className={`cardpicker-wrapper ${isForInstructions ? 'instructions-cardpicker' : ''}`}>
            {topText && <div className="toptext">{topText}</div>}
            <div className="main">
                {!centerActionButton && <span />}
                {mainContent}
                {!noActionButton && (
                    <Button
                        additionalClassname={`confirm-button ${
                            (!isNullOrUndefined(customButtonState) ? customButtonState === 1 : cardsAreSelected) ? 'non-selectable' : ''
                        } ${selectDisabled ? 'disabled' : ''}`}
                        text={!isNullOrUndefined(customButtonState) ? buttonTexts[customButtonState] : cardsAreSelected ? buttonTexts[1] : buttonTexts[0]}
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
                        icon={!isNullOrUndefined(customButtonState) ? buttonIcons[customButtonState] : cardsAreSelected ? buttonIcons[1] : buttonIcons[0]}
                        iconPosition="after"
                        disabled={!isNullOrUndefined(customButtonState) ? customButtonState === 1 : hasAlternativeText || disableConfirmButton}
                    />
                )}
            </div>
            <div className="description">{description}</div>
            <div className={`selectable ${cardsAreSelected || selectCard === emptyFn ? 'non-selectable' : ''}`}>{renderedCards}</div>
        </div>
    );
}

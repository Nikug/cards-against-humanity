import { BUTTON_TYPES, Button } from '../general/Button';
import { containsObjectWithMatchingField, emptyFn, isNullOrUndefined } from '../../helpers/generalhelpers';

import React from 'react';
import { isPlayerJoining } from '../../helpers/player-helpers';
import { renderBlackCardwithWhiteCards } from './cardformathelpers/renderBlackcardWithWhiteCards';
import { translateCommon } from '../../helpers/translation-helpers';
import { useGameContext } from '../../contexts/GameContext';
import { useTranslation } from 'react-i18next';
import { Card } from './card';
import { classNames } from '../../helpers/classnames';
import { CardPickerActionButton } from './components/CardPickerActionButton';

export const CardPicker = ({
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
    showPreviewTitle,
    topText,
}) => {
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

    const buttonText = !isNullOrUndefined(customButtonState) ? buttonTexts[customButtonState] : cardsAreSelected ? buttonTexts[1] : buttonTexts[0];
    const buttonType = !isNullOrUndefined(customButtonState)
        ? customButtonState === 0
            ? BUTTON_TYPES.PRIMARY
            : BUTTON_TYPES.GREEN
        : cardsAreSelected
        ? BUTTON_TYPES.GREEN
        : BUTTON_TYPES.PRIMARY;
    const buttonIcon = !isNullOrUndefined(customButtonState) ? buttonIcons[customButtonState] : cardsAreSelected ? buttonIcons[1] : buttonIcons[0];
    const isButtonDisabled = !isNullOrUndefined(customButtonState) ? customButtonState === 1 : hasAlternativeText || disableConfirmButton;
    const hasActionButton = !noActionButton;

    return (
        <div className={classNames('cardpicker-wrapper', { 'instructions-cardpicker': isForInstructions })}>
            {topText && <div className="toptext">{topText}</div>}
            <div className="main">
                {showPreviewTitle && <div className="description mobile-only">{translateCommon('preview', t)}</div>}
                {!centerActionButton && <span />}
                {mainContent}
                {hasActionButton && (
                    <div className={'action-button-container'}>
                        <CardPickerActionButton
                            additionalClassname={classNames('confirm-button', {
                                'non-selectable': !isNullOrUndefined(customButtonState) ? customButtonState === 1 : cardsAreSelected,
                                disabled: selectDisabled,
                            })}
                            text={buttonText}
                            callback={confirmCards}
                            type={buttonType}
                            icon={buttonIcon}
                            iconPosition="after"
                            disabled={isButtonDisabled}
                        />
                    </div>
                )}
            </div>
            <div className="description">{description}</div>
            <div className={classNames('selectable', { 'non-selectable': cardsAreSelected || selectCard === emptyFn })}>{renderedCards}</div>
            {hasActionButton && (
                <div
                    // This is here to occupy the same emount of space as the StartGameButton would
                    // (which is position absolute and at the bottom of the screen)
                    className="action-button-empty-space"
                >
                    <CardPickerActionButton
                        additionalClassname={classNames('confirm-button', {
                            'non-selectable': !isNullOrUndefined(customButtonState) ? customButtonState === 1 : cardsAreSelected,
                            disabled: selectDisabled,
                        })}
                        text={buttonText}
                        callback={confirmCards}
                        type={buttonType}
                        icon={buttonIcon}
                        iconPosition="after"
                        disabled={isButtonDisabled}
                    />
                </div>
            )}
        </div>
    );
};

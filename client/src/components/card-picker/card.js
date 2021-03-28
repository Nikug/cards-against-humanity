import { emptyFn, isNullOrUndefined } from "../../helpers/generalhelpers.js";

import Icon from "../icon";
import React from "react";
import { translateCommon } from "../../helpers/translation-helpers.js";
import { useTranslation } from "react-i18next";

const CARD_TYPES = {
    WHITE: 1,
    BLACK: 2,
};

function formatTextWithBlanks(text, blankTexts) {
    const splittedText = text.split("_");
    const piecesToRender = [];

    for (
        let i = 0, blankIterator = 0, len = splittedText.length;
        i < len;
        i++
    ) {
        const piece = splittedText[i];
        piecesToRender.push(
            <span key={`t-${i}`} className="text">
                {piece}
            </span>
        );
        if (i === len - 1) {
            break;
        }
        if (blankTexts && blankTexts[blankIterator]) {
            piecesToRender.push(
                <span key={`b-${i}`} className="blank">
                    {blankTexts[blankIterator]}
                </span>
            );
            blankIterator++;
        } else {
            piecesToRender.push(
                <span key={`b-${i}`} className="blank">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
            );
        }
    }

    return <div className="text">{piecesToRender}</div>;
}

/**
 * Everything given via props
 * @param {card} Card The basic card object
 * @param {blankTexts} Array The white cards selected for black card
 * @param {bigCard} boolean Is the card big
 * @param {selected} boolean Is the card selected
 * @param {confirmed} boolean Is the card selection confimred
 */

export default function Card(props) {
    const card = props.card;
    const { cardPackID, text, whiteCardsToPlay, whiteCardsToDraw, id } = card;
    const {
        bigCard,
        blankTexts,
        confirmed,
        givePopularVote,
        hasBeenPopularVoted,
        playerName,
        popularVoteScore,
        selectCard,
        selected,
        showPopularVote,
    } = props;
    const { t } = useTranslation();
    let type = CARD_TYPES.BLACK;

    if (isNullOrUndefined(whiteCardsToPlay)) {
        type = CARD_TYPES.WHITE;
    }

    let textToRender;

    if (type === CARD_TYPES.BLACK) {
        textToRender = formatTextWithBlanks(text, blankTexts);
    } else {
        if (typeof text === "string") {
            textToRender = <div className="text">{text}</div>;
        } else if (Array.isArray(text)) {
            const texts = [];

            for (let i = 0, len = text.length; i < len; i++) {
                const temp = text[i];

                texts.push(<div key={i}>{temp}</div>);
            }
            textToRender = <div className="text">{texts}</div>;
        }
    }

    return (
        <div
            className={`card-wrapper ${bigCard ? "big-card" : ""} ${
                confirmed ? "confirmed" : selected ? "selected" : ""
            } ${type === CARD_TYPES.BLACK ? "black" : "white"}`}
            onClick={() => {
                if (!isNullOrUndefined(selectCard)) {
                    selectCard(card);
                }
            }}
        >
            <div
                className={`card ${
                    type === CARD_TYPES.BLACK ? "black" : "white"
                }`}
            >
                {textToRender}
                <div className="footer">
                    {type === CARD_TYPES.BLACK &&
                        isNullOrUndefined(playerName) && (
                            <span className="draw-and-play">
                                {isNullOrUndefined(cardPackID)
                                    ? ""
                                    : `${translateCommon(
                                          "draw",
                                          t
                                      )} ${whiteCardsToDraw}, Pelaa ${translateCommon(
                                          "play",
                                          t
                                      )}`}
                            </span>
                        )}
                    {playerName && (
                        <span className="draw-and-play">{playerName}</span>
                    )}
                    <span>&nbsp;</span>
                    {!isNullOrUndefined(cardPackID) &&
                        isNullOrUndefined(popularVoteScore) &&
                        !Array.isArray(cardPackID) && (
                            <span className="cardpackid">{cardPackID}</span>
                        )}
                    {showPopularVote &&
                        isNullOrUndefined(popularVoteScore) &&
                        !isNullOrUndefined(cardPackID) &&
                        Array.isArray(cardPackID) && (
                            <span className="popularvote-btn">
                                <Icon
                                    name="thumb_up"
                                    color={
                                        hasBeenPopularVoted ? "blue" : "grey"
                                    }
                                    onClick={
                                        isNullOrUndefined(givePopularVote) ||
                                        hasBeenPopularVoted
                                            ? emptyFn
                                            : () => givePopularVote(id)
                                    }
                                />
                            </span>
                        )}
                    {!isNullOrUndefined(popularVoteScore) &&
                        popularVoteScore > 0 && (
                            <span className="popularvote-btn no-action popular-vote-score">
                                <Icon name="thumb_up" color={"blue"} />
                                <span className="popular-vote-score">
                                    {popularVoteScore}
                                </span>
                            </span>
                        )}
                </div>
            </div>
        </div>
    );
}

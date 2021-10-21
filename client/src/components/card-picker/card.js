import { emptyFn, isNullOrUndefined } from '../../helpers/generalhelpers.js';

import Icon from '../general/Icon';
import { formatTextWithBlanksAsDiv } from './cardformathelpers/formattextwithblanks.js';
import { classNames } from '../../helpers/classnames.js';

const CARD_TYPES = {
    WHITE: 1,
    BLACK: 2,
};

export const Card = ({
    bigCard,
    blankTexts,
    card,
    confirmed,
    givePopularVote,
    hasBeenPopularVoted,
    playerName,
    popularVoteScore,
    selectCard,
    selected,
    showPopularVote,
}) => {
    const { cardPackID, text, whiteCardsToPlay, id } = card;
    let type = CARD_TYPES.BLACK;

    if (isNullOrUndefined(whiteCardsToPlay)) {
        type = CARD_TYPES.WHITE;
    }

    let textToRender;

    if (type === CARD_TYPES.BLACK) {
        textToRender = formatTextWithBlanksAsDiv(text, blankTexts);
    } else {
        if (typeof text === 'string') {
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
            className={`card-wrapper ${bigCard ? 'big-card' : ''} ${confirmed ? 'confirmed' : selected ? 'selected' : ''} ${
                type === CARD_TYPES.BLACK ? 'black' : 'white'
            }`}
            onClick={() => {
                if (!isNullOrUndefined(selectCard)) {
                    selectCard(card);
                }
            }}
        >
            <div className={classNames('card', { white: type === CARD_TYPES.WHITE, black: type === CARD_TYPES.BLACK })}>
                {textToRender}
                <div className="footer">
                    {playerName && <span className="draw-and-play">{playerName}</span>}
                    <span>&nbsp;</span>
                    {!isNullOrUndefined(cardPackID) && isNullOrUndefined(popularVoteScore) && !Array.isArray(cardPackID) && (
                        <span className="cardpackid">{cardPackID}</span>
                    )}
                    {showPopularVote && isNullOrUndefined(popularVoteScore) && !isNullOrUndefined(cardPackID) && Array.isArray(cardPackID) && (
                        <span className="popularvote-btn">
                            <Icon
                                name="thumb_up"
                                color={hasBeenPopularVoted ? 'blue' : 'grey'}
                                onClick={isNullOrUndefined(givePopularVote) || hasBeenPopularVoted ? emptyFn : () => givePopularVote(id)}
                            />
                        </span>
                    )}
                    {!isNullOrUndefined(popularVoteScore) && popularVoteScore > 0 && (
                        <span className="popularvote-btn no-action popular-vote-score">
                            <Icon name="thumb_up" color={'blue'} />
                            <span className="popular-vote-score">{popularVoteScore}</span>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

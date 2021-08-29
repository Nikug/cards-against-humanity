import { CONTROL_TYPES, Setting } from '../settings/setting';
import React, { useEffect, useState } from 'react';
import { emptyFn, isNullOrUndefined, textToSpeech } from '../../helpers/generalhelpers';

import { CardPicker } from './cardpicker';
import { socket } from '../sockets/socket';
import { socketOn } from '../../helpers/communicationhelpers';
import { translateCommon } from '../../helpers/translation-helpers';
import { useTranslation } from 'react-i18next';
import { formatTextWithBlanksAsText } from './cardformathelpers/formattextwithblanks';
import { useSelector } from 'react-redux';
import { gameBlackCardSelector, gameIdSelector } from '../../selectors/gameSelectors';
import { playerIdSelector, playerIsCardCzarSelector } from '../../selectors/playerSelectors';
import { playersListTextToSpeechSelector } from '../../selectors/playersListSelectors';

export const CardReadingContainer = () => {
    const { t } = useTranslation();

    // State
    const gameID = useSelector(gameIdSelector);
    const playerID = useSelector(playerIdSelector);
    const isCardCzar = useSelector(playerIsCardCzarSelector);
    const blackCard = useSelector(gameBlackCardSelector);
    const textToSpeechInUse = useSelector(playersListTextToSpeechSelector);

    const [whiteCards, setWhiteCards] = useState([]);
    const [whiteCardIndex, setWhiteCardIndex] = useState(0);
    const [outOf, setOutOf] = useState(0);

    useEffect(() => {
        const listener = (data) => {
            setWhiteCards(data.whiteCards);
            setWhiteCardIndex(data.index);
            setOutOf(data.outOf);

            // const blackCardToRead = game?.rounds[game.rounds.length - 1].blackCard;
            const blackCardToRead = blackCard;

            if (textToSpeechInUse && !isNullOrUndefined(blackCardToRead)) {
                const whiteCardsToRead = data.whiteCards;
                const blankTexts = [];
                const blackCardTexts = blackCardToRead.text;

                for (let i = 0, len = whiteCardsToRead.length; i < len; i++) {
                    const card = whiteCardsToRead[i];

                    blankTexts.push(card.text.slice(0, card.text.length - 1)); // Cut the extra dot.
                }

                const fullText = formatTextWithBlanksAsText(blackCardTexts, blankTexts);

                textToSpeech(fullText);
            }
        };
        socketOn('show_white_card', listener);

        return () => {
            socket.off('show_white_card');
        };
    }, [textToSpeechInUse, blackCard]);

    function toggleTextToSpeech() {
        socket.emit('change_text_to_speech', {
            gameID,
            playerID,
            useTextToSpeech: !textToSpeechInUse,
        });
    }

    const showNextCard = () => {
        socket.emit('show_next_white_card', {
            gameID,
            playerID,
        });
    };

    const topText = outOf !== 0 ? `${translateCommon('letsReadTheCards', t)} (${whiteCardIndex}/${outOf}):` : `${translateCommon('letsReadTheCards', t)}:`;

    return (
        <div className="cardpicker-container">
            <CardPicker
                mainCard={blackCard}
                selectableCards={[]}
                selectedCards={whiteCards}
                confirmedCards={[]}
                selectCard={emptyFn}
                confirmCards={showNextCard}
                description={''}
                customButtonTexts={
                    whiteCards.length === 0
                        ? [translateCommon('start', t), `${translateCommon('loading', t)}...`]
                        : [translateCommon('next', t), `${translateCommon('loading', t)}...`]
                }
                customButtonIcons={['arrow_forward', 'cached']}
                noActionButton={isCardCzar ? false : true}
                topText={topText}
                noBigMainCard={whiteCards?.length === 0}
            />
            {isCardCzar && (
                <div className="cardreading-settings">
                    <Setting
                        text={translateCommon('readCardsForMe', t)}
                        controlType={CONTROL_TYPES.toggle}
                        onChangeCallback={() => toggleTextToSpeech()}
                        currentValue={textToSpeechInUse}
                        icon={{
                            name: 'record_voice_over',
                            className: 'icon-margin-right',
                        }}
                    />
                </div>
            )}
        </div>
    );
};

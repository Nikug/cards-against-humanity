import { CONTROL_TYPES, Setting } from '../settings/setting';
import React, { useEffect, useState } from 'react';
import { emptyFn, isNullOrUndefined, textToSpeech } from '../../helpers/generalhelpers';

import { CardPicker } from './cardpicker';
import { socket } from '../sockets/socket';
import { socketOn } from '../../helpers/communicationhelpers';
import { translateCommon } from '../../helpers/translation-helpers';
import { useGameContext } from '../../contexts/GameContext';
import { useTranslation } from 'react-i18next';
import { formatTextWithBlanksAsText } from './cardformathelpers/formattextwithblanks';

export const CardReadingContainer = () => {
    const { t } = useTranslation();
    const { game, player } = useGameContext();

    const [whiteCards, setWhiteCards] = useState([]);
    const [whiteCardIndex, setWhiteCardIndex] = useState(0);
    const [outOf, setOutOf] = useState(0);
    const textToSpeechInUse = game?.players?.filter((player) => player.isCardCzar)[0].useTextToSpeech;
    const blackCard = game?.rounds[game.rounds.length - 1].blackCard;

    useEffect(() => {
        const listener = (data) => {
            setWhiteCards(data.whiteCards);
            setWhiteCardIndex(data.index);
            setOutOf(data.outOf);

            const blackCardToRead = game?.rounds[game.rounds.length - 1].blackCard;

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
    }, [textToSpeechInUse]);

    function toggleTextToSpeech() {
        socket.emit('change_text_to_speech', {
            gameID: game?.id,
            playerID: player.id,
            useTextToSpeech: !textToSpeechInUse,
        });
    }

    const showNextCard = () => {
        socket.emit('show_next_white_card', {
            gameID: game?.id,
            playerID: player.id,
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
                noActionButton={player?.isCardCzar ? false : true}
                topText={topText}
                noBigMainCard={whiteCards?.length === 0}
            />
            {player?.isCardCzar && (
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

import React, { useEffect, useState } from 'react';
import { socket } from '../sockets/socket';

import { CardPicker } from './cardpicker';
import { emptyFn, isNullOrUndefined, textToSpeech } from '../../helpers/generalhelpers';
import { Setting, CONTROL_TYPES } from '../settings/setting';

export const CardReadingContainer = (props) => {
    const { game, player } = props;
    const [whiteCards, setWhiteCards] = useState([]);
    const [textToSpeechInUse, setTextToSpeechInUse] = useState(false);
    const blackCard = game.rounds[game.rounds.length - 1].blackCard;

    useEffect(() => {
        const listener = (data) => {
            setWhiteCards(data);

            const blackCardToRead = game.rounds[game.rounds.length - 1].blackCard;

            if (textToSpeechInUse && !isNullOrUndefined(blackCardToRead)) {
                const whiteCardsToRead = data;
                const blankTexts = [];
                const blackCardTexts = blackCardToRead.text;

                for (let i = 0, len = whiteCardsToRead.length; i < len; i++) {
                    const card = whiteCardsToRead[i];

                    blankTexts.push(card.text.slice(0, card.text.length - 1)); // Cut the extra dot.
                }

                const fullText = formatTextWithBlanks(blackCardTexts, blankTexts);

                textToSpeech(fullText);
            }
        };
        socket.on('show_white_card', listener);

        return () => {
            socket.off('show_white_card', listener);
        };
    }, [textToSpeechInUse]);

    function formatTextWithBlanks(text, blankTexts) {
        const splittedText = text.split('_');
        let fullText = '';

        for (let i = 0, blankIterator = 0, len = splittedText.length; i < len; i++) {
            const piece = splittedText[i];
            fullText = fullText + piece;

            if (i === len - 1) {
                break;
            }
            if (blankTexts && blankTexts[blankIterator]) {
                fullText = fullText + blankTexts[blankIterator];
                blankIterator++;
            }
        }

        return fullText;
    }

    function toggleTextToSpeech() {
        setTextToSpeechInUse(!textToSpeechInUse);
    }

    const showNextCard = () => {
        socket.emit('show_next_white_card', {
            gameID: game.id,
            playerID: player.id,
        });
    };

    return (
        <div className='blackcardpicker'>
            <CardPicker
                mainCard={blackCard}
                selectableCards={[]}
                selectedCards={whiteCards}
                confirmedCards={[]}
                selectCard={emptyFn}
                confirmCards={showNextCard}
                description={''}
                customButtonTexts={whiteCards.length === 0 ? ['Aloita', 'Ladataan...'] : ['Seuraava', 'Ladataan...']}
                customButtonIcons={['arrow_forward', 'cached']}
                noActionButton={player?.isCardCzar ? false : true}
                topText={'Luetaan kortit:'}
            />
            {player?.isCardCzar && (
                <div className='cardreading-settings'>
                    <Setting
                        text={'Lue kortit puolestani'}
                        controlType={CONTROL_TYPES.toggle}
                        onChangeCallback={() => toggleTextToSpeech()}
                        currentValue={textToSpeechInUse}
                        icon={{
                            name: 'record_voice_over',
                            className: 'md-36 icon-margin-right',
                        }}
                    />
                </div>
            )}
        </div>
    );
};

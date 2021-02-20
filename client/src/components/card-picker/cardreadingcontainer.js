import { CONTROL_TYPES, Setting } from "../settings/setting";
import React, { useEffect, useState } from "react";
import {
    emptyFn,
    isNullOrUndefined,
    textToSpeech,
} from "../../helpers/generalhelpers";

import { CardPicker } from "./cardpicker";
import { socket } from "../sockets/socket";

export const CardReadingContainer = (props) => {
    const { game, player } = props;
    const [whiteCards, setWhiteCards] = useState([]);
    const [whiteCardIndex, setWhiteCardIndex] = useState(0);
    const [outOf, setOutOf] = useState(0);
    const textToSpeechInUse = game.players.filter(
        (player) => player.isCardCzar
    )[0].useTextToSpeech;
    console.log({ textToSpeechInUse, players: game.players });
    const blackCard = game.rounds[game.rounds.length - 1].blackCard;

    useEffect(() => {
        const listener = (data) => {
            setWhiteCards(data.whiteCards);
            setWhiteCardIndex(data.index);
            setOutOf(data.outOf);

            const blackCardToRead =
                game.rounds[game.rounds.length - 1].blackCard;

            if (textToSpeechInUse && !isNullOrUndefined(blackCardToRead)) {
                const whiteCardsToRead = data.whiteCards;
                const blankTexts = [];
                const blackCardTexts = blackCardToRead.text;

                for (let i = 0, len = whiteCardsToRead.length; i < len; i++) {
                    const card = whiteCardsToRead[i];

                    blankTexts.push(card.text.slice(0, card.text.length - 1)); // Cut the extra dot.
                }

                const fullText = formatTextWithBlanks(
                    blackCardTexts,
                    blankTexts
                );

                textToSpeech(fullText);
            }
        };
        socket.on("show_white_card", listener);

        return () => {
            socket.off("show_white_card", listener);
        };
    }, [textToSpeechInUse]);

    function formatTextWithBlanks(text, blankTexts) {
        const splittedText = text.split("_");
        let fullText = "";

        for (
            let i = 0, blankIterator = 0, len = splittedText.length;
            i < len;
            i++
        ) {
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
        console.log(textToSpeech);
        socket.emit("change_text_to_speech", {
            gameID: game.id,
            playerID: player.id,
            useTextToSpeech: !textToSpeechInUse,
        });
    }

    const showNextCard = () => {
        socket.emit("show_next_white_card", {
            gameID: game.id,
            playerID: player.id,
        });
    };

    const topText =
        outOf !== 0
            ? `Luetaan kortit (${whiteCardIndex}/${outOf}):`
            : "Luetaan kortit:";

    return (
        <div className="blackcardpicker">
            <CardPicker
                mainCard={blackCard}
                selectableCards={[]}
                selectedCards={whiteCards}
                confirmedCards={[]}
                selectCard={emptyFn}
                confirmCards={showNextCard}
                description={""}
                customButtonTexts={
                    whiteCards.length === 0
                        ? ["Aloita", "Ladataan..."]
                        : ["Seuraava", "Ladataan..."]
                }
                customButtonIcons={["arrow_forward", "cached"]}
                noActionButton={player?.isCardCzar ? false : true}
                topText={topText}
            />
            {player?.isCardCzar && (
                <div className="cardreading-settings">
                    <Setting
                        text={"Lue kortit puolestani"}
                        controlType={CONTROL_TYPES.toggle}
                        onChangeCallback={() => toggleTextToSpeech()}
                        currentValue={textToSpeechInUse}
                        icon={{
                            name: "record_voice_over",
                            className: "md-36 icon-margin-right",
                        }}
                    />
                </div>
            )}
        </div>
    );
};

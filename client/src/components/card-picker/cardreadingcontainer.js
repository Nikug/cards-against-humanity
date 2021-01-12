import React, { useEffect, useState } from "react";
import { socket } from "../sockets/socket";

import { CardPicker } from "./cardpicker";
import {
    emptyFn,
    isNullOrUndefined,
    textToSpeech,
} from "../../helpers/generalhelpers";

export function CardReadingContainer(props) {
    const { game, player } = props;
    const [whiteCards, setWhiteCards] = useState();
    const [textToSpeechInUse, setTextToSpeechInUse] = useState(false);
    const blackCard = game.rounds[game.rounds.length - 1].blackCard;
    let prevBlackCard = { text: null };

    useEffect(() => {
        socket.on("show_white_card", (data) => {
            setWhiteCards(data);

            // Without this check, textToSpeech is called with new whiteCards and with previous blackCard.
            if (blackCard.text !== prevBlackCard.text && textToSpeechInUse) {
                const whiteCardsToRead = data;
                const blankTexts = [];
                const blackCardTexts = blackCard.text;

                for (let i = 0, len = whiteCardsToRead.length; i < len; i++) {
                    const card = whiteCardsToRead[i];

                    blankTexts.push(card.text.slice(0, card.text.length - 1)); // Cut the extra dot.
                }

                console.log({ blackCardTexts, blankTexts });
                const fullText = formatTextWithBlanks(
                    blackCardTexts,
                    blankTexts
                );

                textToSpeech(fullText);
                prevBlackCard = blackCard;
            }
        });
    }, []);

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

    const showNextCard = () => {
        socket.emit("show_next_white_card", {
            gameID: game.id,
            playerID: player.id,
        });
    };

    return (
        <div className="blackcardpicker">
            <CardPicker
                mainCard={blackCard}
                selectableCards={[]}
                selectedCards={isNullOrUndefined(whiteCards) ? [] : whiteCards}
                confirmedCards={[]}
                selectCard={emptyFn}
                confirmCards={showNextCard}
                description={""}
                customButtonTexts={
                    isNullOrUndefined(whiteCards)
                        ? ["Aloita", "Ladataan..."]
                        : ["Seuraava", "Ladataan..."]
                }
                customButtonIcons={["arrow_forward", "cached"]}
                noActionButton={player?.isCardCzar ? false : true}
                topText={"Luetaan kortit:"}
            />
        </div>
    );
}

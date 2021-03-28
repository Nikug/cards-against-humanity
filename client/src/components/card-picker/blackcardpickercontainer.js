import React, { useEffect, useState } from "react";
import {
    containsObjectWithMatchingFieldIndex,
    emptyFn,
    isNullOrUndefined,
} from "../../helpers/generalhelpers";

import { CardPicker } from "./cardpicker";
import { socket } from "../sockets/socket";
import { translateCommon } from "../../helpers/translation-helpers";
import { useTranslation } from "react-i18next";

export const BlackCardPickerContainer = (props) => {
    const { t } = useTranslation();
    const [selectedCards, setSelectedCards] = useState([]);
    const [confirmedCards, setConfirmedCards] = useState([]);
    const { blackCards } = props;

    const selectCard = (card) => {
        const game = props.game;
        const newSelectedCards = selectedCards.slice();
        let pickLimit = 1;

        if (isNullOrUndefined(card.whiteCardsToPlay)) {
            pickLimit =
                game.rounds[game.rounds.length - 1].blackCard.whiteCardsToPlay;
        }

        const i = containsObjectWithMatchingFieldIndex(
            card,
            newSelectedCards,
            "id"
        );
        if (i !== -1) {
            newSelectedCards.splice(i);
        } else if (newSelectedCards.length < pickLimit) {
            newSelectedCards.push(card);
        } else {
            newSelectedCards.pop();
            newSelectedCards.push(card);
        }
        setSelectedCards(newSelectedCards);
    };

    const confirmCard = () => {
        if (selectedCards.length === 1) {
            const cardID = selectedCards[0].id;
            const gameID = props.game.id;
            const playerID = props.player.id;
            socket.emit("select_black_card", {
                gameID: gameID,
                playerID: playerID,
                selectedCardID: cardID,
                discardedCardIDs: blackCards
                    .filter((blackCard) => blackCard.id !== cardID)
                    .map((blackCard) => blackCard.id),
            });

            setConfirmedCards(selectedCards.slice());
        } else {
            console.log("Error: There was no black card to confirm");
        }
    };

    return (
        <div className="blackcardpicker">
            <CardPicker
                pickingBlackCard={true}
                selectableCards={blackCards}
                selectedCards={selectedCards}
                confirmedCards={confirmedCards}
                selectCard={confirmedCards.length > 0 ? emptyFn : selectCard}
                confirmCards={confirmCard}
                description={translateCommon("chooseBlackCard", t)}
                disableConfirmButton={
                    confirmedCards.length > 0 || selectedCards.length !== 1
                }
                noBigMainCard={true}
            />
        </div>
    );
};

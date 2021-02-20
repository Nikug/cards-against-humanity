import React, { useEffect, useState } from "react";
import { socket } from "../sockets/socket";

import { CardPicker } from "./cardpicker";
import {
    isNullOrUndefined,
    containsObjectWithMatchingFieldIndex,
    emptyFn,
} from "../../helpers/generalhelpers";

export const BlackCardPickerContainer = (props) => {
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
            console.log("There was no black card to confirm");
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
                description={"Valitse musta kortti"}
                //alternativeText={"Korttikuningas valitsee mustaa korttia"}
                disableConfirmButton={confirmedCards.length > 0}
            />
        </div>
    );
};

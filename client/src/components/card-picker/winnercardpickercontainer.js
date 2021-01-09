import React, { useEffect, useState } from "react";
import { socket } from "../sockets/socket";

import { CardPicker } from "./cardpicker";
import { getBlackCard, getWhiteCard } from "../../fakedata/fakecarddata";
import {
    emptyFn,
    isNullOrUndefined,
    containsObjectWithMatchingFieldIndex,
} from "../../helpers/generalhelpers";

export function WinnerCardPickerContainer(props) {
    const { game, player } = props;
    const [whiteCards, setWhiteCards] = useState(player.whiteCards);
    const [selectedCards, setSelectedCards] = useState([]);
    const [confirmedCards, setConfirmedCards] = useState([]);

    const selectCard = (card) => {
        if (confirmedCards.length > 0) {
            return;
        }
        const newSelectedCards = selectedCards.slice();

        const pickLimit = 1;

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
        const pickLimit =
            game.rounds[game.rounds.length - 1].blackCard.whiteCardsToPlay;

        if (selectedCards.length === pickLimit) {
            const gameID = props.game.id;
            const playerID = props.player.id;
            socket.emit("play_white_cards", {
                gameID: gameID,
                playerID: playerID,
                whiteCardIDs: selectedCards.map((whiteCard) => whiteCard.id),
            });

            setConfirmedCards(selectedCards);
        } else {
            console.log("There was not enough white cards to confirm");
        }
    };

    const blackCard = game.rounds[game.rounds.length - 1].blackCard;

    return (
        <div className="blackcardpicker">
            <CardPicker
                mainCard={blackCard}
                selectableCards={whiteCards}
                selectedCards={selectedCards}
                confirmedCards={confirmedCards}
                selectCard={selectCard}
                confirmCards={confirmCard}
                description={"Valitse voittaja"}
            />
        </div>
    );
}

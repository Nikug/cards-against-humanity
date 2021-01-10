import React, { useEffect, useState } from "react";
import { socket } from "../sockets/socket";

import { CardPicker } from "./cardpicker";
import { getBlackCard, getWhiteCard } from "../../fakedata/fakecarddata";
import { CardPack } from "../game-settings/cardpack";
import {
    emptyFn,
    isNullOrUndefined,
    containsObjectWithMatchingFieldIndex,
} from "../../helpers/generalhelpers";

export function WinnerCardPickerContainer(props) {
    const { game, player } = props;

    const whiteCardsByPlayer =
        game.rounds[game.rounds.length - 1].whiteCardsByPlayer;
    const whiteCardsToRender = [];

    for (let i = 0, len = whiteCardsByPlayer.length; i < len; i++) {
        const whiteCards = whiteCardsByPlayer[i].whiteCards;
        const newWhiteCard = {
            id: [],
            cardPackID: [],
            text: [],
        };

        for (let j = 0, len2 = whiteCards.length; j < len2; j++) {
            const whiteCard = whiteCards[j];

            newWhiteCard.id.push(whiteCard.id);
            newWhiteCard.cardPackID.push(whiteCard.cardPackID);
            newWhiteCard.text.push(whiteCard.text);
        }

        whiteCardsToRender.push(newWhiteCard);
    }

    const [whiteCards, setWhiteCards] = useState(whiteCardsToRender);
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
        const pickLimit = 1;

        if (selectedCards.length === pickLimit) {
            const gameID = props.game.id;
            const playerID = props.player.id;

            console.log("aaaa", { selectedCards });
            socket.emit("pick_winning_card", {
                gameID: gameID,
                playerID: playerID,
                whiteCardIDs: selectedCards[0].id,
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

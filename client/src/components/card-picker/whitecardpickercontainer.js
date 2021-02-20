import React, { useState } from "react";
import { socket } from "../sockets/socket";

import { CardPicker } from "./cardpicker";
import { containsObjectWithMatchingFieldIndex } from "../../helpers/generalhelpers";

export function WhiteCardPickerContainer(props) {
    const { game, player } = props;
    const whiteCards = player.whiteCards;
    const [selectedCards, setSelectedCards] = useState([]);
    const [confirmedCards, setConfirmedCards] = useState([]);

    const pickLimit =
        game.rounds[game.rounds.length - 1].blackCard.whiteCardsToPlay;

    const selectCard = (card) => {
        if (confirmedCards.length > 0) {
            return;
        }
        const newSelectedCards = selectedCards.slice();

        const pickLimit =
            game.rounds[game.rounds.length - 1].blackCard.whiteCardsToPlay;

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
                description={"Valitse valkoinen kortti"}
                selectDisabled={selectedCards.length !== pickLimit}
                noBigMainCard={false}
            />
        </div>
    );
}

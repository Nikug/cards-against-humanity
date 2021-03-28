import React, { useState } from "react";

import { CardPicker } from "./cardpicker";
import { containsObjectWithMatchingFieldIndex } from "../../helpers/generalhelpers";
import { socket } from "../sockets/socket";
import { translateCommon } from "../../helpers/translation-helpers";
import { useTranslation } from "react-i18next";

export function WhiteCardPickerContainer({ game, player }) {
    const { t } = useTranslation();
    const whiteCards = player?.whiteCards;
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
            const gameID = game.id;
            const playerID = player.id;
            socket.emit("play_white_cards", {
                gameID: gameID,
                playerID: playerID,
                whiteCardIDs: selectedCards.map((whiteCard) => whiteCard.id),
            });

            setConfirmedCards(selectedCards);
        } else {
            console.log("ERROR: There was not enough white cards to confirm");
        }
    };

    const blackCard = game.rounds[game.rounds.length - 1].blackCard;

    return (
        <div className="blackcardpicker">
            <CardPicker
                alternativeText={
                    confirmedCards.length > 0
                        ? translateCommon(
                              "otherPlayersAreStillChoosingCards",
                              t
                          )
                        : null
                }
                mainCard={blackCard}
                selectableCards={whiteCards}
                selectedCards={selectedCards}
                confirmedCards={confirmedCards}
                selectCard={selectCard}
                confirmCards={confirmCard}
                description={translateCommon("chooseWhiteCard", t)}
                selectDisabled={selectedCards.length !== pickLimit}
                noBigMainCard={false}
            />
        </div>
    );
}

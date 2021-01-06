import React, { useEffect, useState } from "react";
import { socket } from "../sockets/socket";

import { CardPicker } from "./cardpicker";
import { getBlackCard, getWhiteCard } from "./../../fakedata/fakecarddata";
import {
    emptyFn,
    isNullOrUndefined,
    containsObjectWithMatchingFieldIndex,
} from "../../helpers/generalhelpers";

export function BlackCardPickerContainer(props) {
    const [blackCards, setBlackCards] = useState(undefined);
    const [selectedCards, setSelectedCards] = useState([]);
    const [confirmedCards, setConfirmedCards] = useState([]);

    useEffect(() => {
        const { player, game } = props;
        if (blackCards === undefined && game && player && player.isCardCzar) {
            socket.emit("draw_black_cards", {
                gameID: game.id,
                playerID: props.player.id,
            });
        }
    }, [
        blackCards,
        props.game?.id,
        props.player?.id,
        props.player?.isCardCzar,
    ]);

    useEffect(() => {
        socket.on("deal_black_cards", (data) => {
            setBlackCards(data.blackCards);
        });
    }, []);

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
                selectCard={selectCard}
                confirmCards={confirmCard}
                description={"Valitse musta kortti"}
            />
        </div>
    );
}

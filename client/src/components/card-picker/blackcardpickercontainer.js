import React, { useEffect, useState } from "react";
import { socket } from "../sockets/socket";

export function BlackCardPickerContainer(props) {
    const [blackCards, setBlackCards] = useState(undefined);
    const [selectedCards, setSelectedCards] = useState([]);

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

    const selectCard = (cardID) => {
        const game = props.game;
        const pickLimit =
            game.rounds[game.rounds.length - 1].blackCard.whiteCardsToPlay;
    };

    const confirmCard = (cardID) => {
        if (props.selectectedCardType === "black") {
            socket.emit("select_black_card", {
                gameID: props.gameID,
                playerID: props.player.id,
                selectedCardID: cardID,
                discardedCardIDs: blackCards
                    .filter((blackCard) => blackCard.id !== cardID)
                    .map((blackCard) => blackCard.id),
            });
        } else {
            if (selectedCards.length !== props.pickLimit) return;
            socket.emit("play_white_cards", {
                gameID: props.gameID,
                playerID: props.player.id,
                whiteCardIDs: selectedCards,
            });
        }
    };

    return (
        <div className="cardpicker-wrapper">
            <span>aaaa</span>
            {blackCards?.map((blackCard, i) => (
                <div
                    key={i}
                    type="black"
                    card={blackCard}
                    onClick={selectCard}
                />
            ))}
        </div>
    );
}

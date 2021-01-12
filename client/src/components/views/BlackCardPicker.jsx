import React, { useEffect, useState } from "react";
import { socket } from "../sockets/socket";

import { Card } from "../cards/Card";

export const BlackCardPicker = (props) => {
    const [blackCards, setBlackCards] = useState(undefined);

    useEffect(() => {
        console.log(`game id ${props.gameID}, player id ${props.player.id}, is card czar ${props.player.isCardCzar}`);
        if (props.player.isCardCzar) {
            console.log("called emit");
            socket.emit("draw_black_cards", {
                gameID: props.gameID,
                playerID: props.player.id,
            });
        }
    }, [props.gameID, props.player.id, props.player.isCardCzar]);

    // useEffect(() => {
    //     socket.on("deal_black_cards", (data) => {
    //         setBlackCards(data.blackCards);
    //     });
    // }, []);

    const selectBlackCard = (cardID) => {
        socket.emit("select_black_card", {
            gameID: props.gameID,
            playerID: props.player.id,
            selectedCardID: cardID,
            discardedCardIDs: blackCards
                .filter((blackCard) => blackCard.id !== cardID)
                .map((blackCard) => blackCard.id),
        });
    };

    return (
        <div>
            {blackCards?.map((blackCard, i) => (
                <Card
                    key={i}
                    type="black"
                    card={blackCard}
                    onClick={selectBlackCard}
                />
            ))}
        </div>
    );
};

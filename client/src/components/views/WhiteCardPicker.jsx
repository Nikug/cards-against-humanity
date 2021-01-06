import React, { useState } from "react";
import { socket } from "../sockets/socket";

import { Card } from "../cards/Card";
import Button from "../../components/button";

export const WhiteCardPicker = (props) => {
    const [selectedCards, selectCard] = useState([]);

    const selectWhiteCard = (whiteCardID) => {
        if (!selectedCards.includes(whiteCardID)) {
            if (selectedCards.length === props.pickLimit) return;
            selectCard((prev) => [...prev, whiteCardID]);
        } else {
            selectCard((prev) => prev.filter((id) => id !== whiteCardID));
        }
    };

    const playCards = () => {
        if (selectedCards.length !== props.pickLimit) return;
        socket.emit("play_white_cards", {
            gameID: props.gameID,
            playerID: props.player.id,
            whiteCardIDs: selectedCards,
        });
    };

    return (
        <div>
            {props.player.whiteCards.map((card) => (
                <Card
                    key={card.id}
                    type="white"
                    card={card}
                    onClick={selectWhiteCard}
                />
            ))}
            <Button
                text="Pelaa kortit"
                type="primary"
                callback={() => playCards()}
            />
        </div>
    );
};

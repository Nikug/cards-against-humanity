import React, { useEffect, useState } from "react";
import { socket } from "../sockets/socket";

import { Card } from "../cards/Card";

export const BlackCardPicker = (props) => {

    const [blackCard, setBlackCard] = useState(undefined);

    useEffect(() => {
        if(blackCard === undefined && props.player.isCardCzar) {
            socket.emit("draw_black_card", { gameID: props.gameID, playerID: props.player.id });
        }
    }, [blackCard, props.gameID, props.player.id, props.player.isCardCzar])

    useEffect(() => {
        socket.on("deal_black_card", (data) => {
            setBlackCard(data.blackCard);
        });
    }, []);

    return (
        <div>
            {!!blackCard && 
                <Card type="black" card={blackCard} />
            }
        </div>
    );
}
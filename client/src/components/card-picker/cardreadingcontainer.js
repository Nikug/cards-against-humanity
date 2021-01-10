import React, { useEffect, useState } from "react";
import { socket } from "../sockets/socket";

import { CardPicker } from "./cardpicker";
import { emptyFn, isNullOrUndefined } from "../../helpers/generalhelpers";

export function CardReadingContainer(props) {
    const { game, player } = props;
    const [whiteCards, setWhiteCards] = useState([]);
    const blackCard = game.rounds[game.rounds.length - 1].blackCard;

    useEffect(() => {
        socket.on("show_white_card", (data) => {
            setWhiteCards(data);
        });
    }, []);

    const showNextCard = () => {
        socket.emit("show_next_white_card", {
            gameID: game.id,
            playerID: player.id,
        });
    };

    return (
        <div className="blackcardpicker">
            <CardPicker
                mainCard={blackCard}
                selectableCards={[]}
                selectedCards={isNullOrUndefined(whiteCards) ? [] : whiteCards}
                confirmedCards={[]}
                selectCard={emptyFn}
                confirmCards={showNextCard}
                description={""}
                customButtonTexts={["Seuraava", "Ladataan..."]}
                customButtonIcons={["arrow_forward", "cached"]}
            />
        </div>
    );
}

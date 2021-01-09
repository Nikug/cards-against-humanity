import React, { useEffect, useState } from "react";
import { socket } from "../sockets/socket";

import { CardPicker } from "./cardpicker";
import { getBlackCard, getWhiteCard } from "../../fakedata/fakecarddata";
import {
    emptyFn,
    isNullOrUndefined,
    containsObjectWithMatchingFieldIndex,
} from "../../helpers/generalhelpers";

export function WaitingCardPickerContainer(props) {
    const { game, player, alternativeText, showMainCard = true } = props;
    const [whiteCards, setWhiteCards] = useState(player.whiteCards);

    let mainCard = null;

    if (showMainCard) {
        mainCard = game?.rounds[game?.rounds?.length - 1].blackCard;
    }

    console.log("waiting cardpicker", { game });

    return (
        <div className="blackcardpicker waiting">
            <CardPicker
                alternativeText={alternativeText}
                mainCard={mainCard}
                selectableCards={whiteCards}
                selectedCards={[]}
                confirmedCards={[]}
                selectCard={emptyFn}
                confirmCards={emptyFn}
                description={"Valkoiset korttisi"}
            />
        </div>
    );
}

import React, { useEffect, useState } from "react";
import { socket } from "../sockets/socket";

import { CardPicker } from "./cardpicker";
import { getBlackCard, getWhiteCard } from "../../fakedata/fakecarddata";
import {
    emptyFn,
    isNullOrUndefined,
    containsObjectWithMatchingFieldIndex,
} from "../../helpers/generalhelpers";
import { GAME_STATES } from "../../consts/gamestates";

export function WaitingCardPickerContainer(props) {
    const { game, player, alternativeText, showMainCard, gameState } = props;
    const [whiteCards, setWhiteCards] = useState(
        gameState === GAME_STATES.SHOWING_CARDS
            ? game.rounds[game.rounds.length - 1].whiteCardsByPlayer
            : player.whiteCards
    );

    let mainCard = null;

    if (showMainCard !== false) {
        mainCard = game?.rounds[game?.rounds?.length - 1].blackCard;
    }

    console.log("waiting cardpicker", { whiteCards });

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

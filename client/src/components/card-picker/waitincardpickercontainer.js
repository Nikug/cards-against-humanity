import React from "react";

import { CardPicker } from "./cardpicker";
import { emptyFn } from "../../helpers/generalhelpers";
import { GAME_STATES } from "../../consts/gamestates";

export function WaitingCardPickerContainer(props) {
    const { game, player, alternativeText, showMainCard, gameState } = props;
    const whiteCards =
        gameState === GAME_STATES.SHOWING_CARDS
            ? game.rounds[game.rounds.length - 1].whiteCardsByPlayer
            : player?.whiteCards;
    let mainCard = null;

    if (showMainCard !== false) {
        mainCard = game?.rounds[game?.rounds?.length - 1].blackCard;
    }

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
                noActionButton={true}
            />
        </div>
    );
}

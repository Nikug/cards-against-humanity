import React from "react";

import { CardPicker } from "./cardpicker";
import { emptyFn } from "../../helpers/generalhelpers";
import { GAME_STATES } from "../../consts/gamestates";
import { isPlayerSpectatorOrJoining } from "../../helpers/player-helpers";

export function WaitingCardPickerContainer(props) {
    const {
        game,
        player,
        alternativeText,
        showMainCard,
        gameState,
        noBigMainCard,
    } = props;

    const isSpectator = isPlayerSpectatorOrJoining(player);
    let whiteCards;

    if (isSpectator) {
        whiteCards = [];
    } else {
        whiteCards =
            gameState === GAME_STATES.SHOWING_CARDS
                ? game.rounds[game.rounds.length - 1].whiteCardsByPlayer
                : player?.whiteCards;
    }

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
                description={isSpectator ? null : "Valkoiset korttisi"}
                noActionButton={true}
                noBigMainCard={noBigMainCard}
            />
        </div>
    );
}

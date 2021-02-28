import React from "react";
import Button, { BUTTON_TYPES } from "../../../../components/button";

export const StartGameButton = ({
    game,
    player,
    startGame,
    disableStartGameButton,
}) => {
    return (
        <Button
            icon={"play_circle_filled"}
            iconPosition={"after"}
            text={"Aloita peli"}
            type={BUTTON_TYPES.GREEN}
            additionalClassname={"big-btn"}
            callback={() => startGame(game?.id, player?.id)}
            disabled={disableStartGameButton || player?.isHost !== true}
        />
    );
};

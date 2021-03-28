import { BUTTON_TYPES, Button } from "../../../../components/button";

import React from "react";
import { translateCommon } from "../../../../helpers/translation-helpers";
import { useTranslation } from "react-i18next";

export const StartGameButton = ({
    game,
    player,
    startGame,
    disableStartGameButton,
}) => {
    const { t } = useTranslation();

    return (
        <Button
            icon={"play_circle_filled"}
            iconPosition={"after"}
            text={translateCommon("startGame", t)}
            type={BUTTON_TYPES.GREEN}
            additionalClassname={"big-btn"}
            callback={() => startGame(game?.id, player?.id)}
            disabled={disableStartGameButton || player?.isHost !== true}
        />
    );
};

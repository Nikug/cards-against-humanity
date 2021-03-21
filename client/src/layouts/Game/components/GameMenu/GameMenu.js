import React from "react";
import { useGameContext } from "../../../../contexts/GameContext";
import { GAME_STATES } from "../../../../consts/gamestates";
import { SocketMessenger } from "../../../../components/socket-messenger/socket-messenger";
import { PopOverMenu } from "../../../../components/popover-menu/PopoverMenu";
import { ActionButtonRow } from "./ActionButtonRow";
import {
    isPlayerHost,
    isPlayerSpectator,
} from "../../../../helpers/player-helpers";
import { BUTTON_TYPES } from "../../../../components/button";
import { emptyFn } from "../../../../helpers/generalhelpers";

export const GameMenu = ({
    callbacks: {
        togglePlayerMode,
        returnBackToLobby,
        openGameSettings,
        openHistory,
    },
    showDebug,
}) => {
    const { game, player } = useGameContext();

    const isLobby = game?.state === GAME_STATES.LOBBY;
    const isSpectator = isPlayerSpectator(player);

    return (
        <>
            <PopOverMenu
                buttonProps={{ icon: "menu" }}
                content={
                    <>
                        Valikko
                        <ActionButtonRow
                            buttons={[
                                isSpectator
                                    ? {
                                          icon: "login",
                                          text: "Liity peliin",
                                          callback: togglePlayerMode,
                                          type: BUTTON_TYPES.PRIMARY,
                                      }
                                    : {
                                          icon: "groups",
                                          text: "Siirry katsomoon",
                                          callback: togglePlayerMode,
                                          type: BUTTON_TYPES.PRIMARY,
                                      },
                                {
                                    icon: "home",
                                    text: "Takaisin aulaan",
                                    callback: returnBackToLobby,
                                    type: BUTTON_TYPES.PRIMARY,
                                    disabled: !isPlayerHost(player) || isLobby,
                                },
                                {
                                    icon: "settings",
                                    text: "Pelin asetukset",
                                    callback: openGameSettings,
                                    type: BUTTON_TYPES.PRIMARY,
                                },
                                {
                                    icon: "history",
                                    text: "Historia",
                                    callback: openHistory,
                                    type: BUTTON_TYPES.PRIMARY,
                                    disabled: !(game?.rounds?.length > 0),
                                },
                            ]}
                        />
                    </>
                }
            />
            {showDebug && (
                <PopOverMenu
                    buttonProps={{ icon: "menu", text: "Debug" }}
                    content={
                        <SocketMessenger
                            gameID={game?.id}
                            playerID={player?.id}
                        />
                    }
                />
            )}
        </>
    );
};

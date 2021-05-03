import React from "react";
import { NamePicker } from "./NamePicker";
import { StartGameButton } from "./StartGameButton";
import { GameSettings } from "../../../../components/game-settings/GameSettings";
import { GameSettingsHeader } from "../../../../components/game-settings/GamseSettingsHeader";
import { translateCommon } from "../../../../helpers/translation-helpers";
import { AvatarCreator } from "../../../../components/game-settings/AvatarCreator";

export const LobbyContent = ({
    disableStartGameButton,
    game,
    player,
    setPlayerName,
    startGame,
}) => {
    return (
        <div className="game-settings-container">
            <div className="lobby-container-grid">
                <div className="settings-block">
                    <GameSettingsHeader plainText={"Avatar"} />
                    <AvatarCreator />
                </div>
                <div className="settings-block">
                    <GameSettingsHeader keyword={"ownSettings"} />
                    <div className={"justify-between column fill"}>
                        <NamePicker setPlayerName={setPlayerName} />
                        {player?.isHost && (
                            <div className="start-game-button-container">
                                <StartGameButton
                                    startGame={startGame}
                                    game={game}
                                    player={player}
                                    disableStartGameButton={
                                        disableStartGameButton
                                    }
                                />
                            </div>
                        )}
                    </div>
                </div>

                <GameSettings
                    options={game ? game.options : {}}
                    gameID={game?.id}
                    isDisabled={player?.isHost !== true}
                    playerID={player?.id}
                />
                <div
                    // This is here to occupy the same emount of space as the StartGameButton would
                    // (which is position absolute and at the bottom of the screen)
                    className="start-game-button-empty-space"
                >
                    <StartGameButton isDisabled={true} />
                </div>
            </div>
        </div>
    );
};

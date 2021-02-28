import React from "react";
import { NamePicker } from "./NamePicker";
import { StartGameButton } from "./StartGameButton";
import { GameSettingsContainer } from "../../../../components/game-settings/gamesettingscontainer";

export const LobbyContent = ({
    game,
    player,
    setPlayerName,
    startGame,
    disableStartGameButton,
}) => {
    return (
        <>
            <div className="info">
                <div className="game-settings-container">
                    <div className="nick-and-start-container">
                        <NamePicker setPlayerName={setPlayerName} />
                        {player?.isHost && (
                            <StartGameButton
                                startGame={startGame}
                                game={game}
                                player={player}
                                disableStartGameButton={disableStartGameButton}
                            />
                        )}
                    </div>
                </div>
            </div>
            <div className="info">
                <GameSettingsContainer
                    options={game ? game.options : {}}
                    gameID={game?.id}
                    isHost={player?.isHost}
                    isDisabled={player?.isHost !== true}
                    playerID={player?.id}
                />
            </div>
        </>
    );
};

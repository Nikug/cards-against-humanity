import React from 'react';
import { GameSettings } from '../../../../components/game-settings/GameSettings';
import { GameSettingsHeader } from '../../../../components/game-settings/GameSettingsHeader';
import { useSelector } from 'react-redux';
import { playerSelector } from '../../../../selectors/playerSelectors';
import { gameSelector } from '../../../../selectors/gameSelectors';
import { OwnSettings } from '../../../../components/game-settings/OwnSettings';

export const LobbyContent = ({ disableStartGameButton, setPlayerName, setPlayerAvatar, startGame }) => {
    const player = useSelector(playerSelector);
    const game = useSelector(gameSelector);
    const isHost = player?.isHost;

    return (
        <div className="game-settings-container">
            <div className="lobby-container-grid">
                <div className="settings-block">
                    <GameSettingsHeader keyword={'ownSettings'} />
                    <OwnSettings
                        isHost={isHost}
                        setPlayerName={setPlayerName}
                        setPlayerAvatar={setPlayerAvatar}
                        disableStartGameButton={disableStartGameButton}
                        game={game}
                        player={player}
                        startGame={startGame}
                    />
                </div>
                <GameSettings options={game ? game.options : {}} gameID={game?.id} isDisabled={player?.isHost !== true} playerID={player?.id} />
            </div>
        </div>
    );
};

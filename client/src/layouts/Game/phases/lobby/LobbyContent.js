import React from 'react';
import { GameSettings } from '../../../../components/game-settings/GameSettings';
import { GameSettingsHeader } from '../../../../components/game-settings/GameSettingsHeader';
import { useSelector } from 'react-redux';
import { playerSelector } from '../../../../selectors/playerSelectors';
import { gameSelector } from '../../../../selectors/gameSelectors';
import { PlayerSettings } from '../../../../components/game-settings/PlayerSettings';
import { StartGameButton } from './StartGameButton';

export const LobbyContent = ({ disableStartGameButton, startGame }) => {
    const player = useSelector(playerSelector);
    const game = useSelector(gameSelector);
    const isHost = player?.isHost;

    return (
        <div className="game-settings-container">
            <div className="lobby-container-grid">
                <div className="settings-block">
                    <GameSettingsHeader keyword={'ownSettings'} />
                    <PlayerSettings isHost={isHost} disableStartGameButton={disableStartGameButton} game={game} player={player} startGame={startGame} />
                </div>
                <GameSettings options={game ? game.options : {}} gameID={game?.id} isDisabled={player?.isHost !== true} playerID={player?.id} />
                {isHost && (
                    <div
                        // This is here to occupy the same emount of space as the StartGameButton would
                        // (which is position absolute and at the bottom of the screen)
                        className="start-game-button-empty-space"
                    >
                        <StartGameButton isDisabled={true} />
                    </div>
                )}
            </div>
        </div>
    );
};

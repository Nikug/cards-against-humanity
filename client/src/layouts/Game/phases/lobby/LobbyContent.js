import React from 'react';
import { GameSettings } from '../../../../components/game-settings/GameSettings';
import { GameSettingsHeader } from '../../../../components/game-settings/GameSettingsHeader';
import { useSelector } from 'react-redux';
import { playerSelector } from '../../../../selectors/playerSelectors';
import { gameSelector } from '../../../../selectors/gameSelectors';
import { StartGameButton } from './StartGameButton';
import { NamePicker } from './NamePicker';
import { AvatarCreator } from '../../../../components/game-settings/avatar-creator/AvatarCreator';

export const LobbyContent = ({ disableStartGameButton, startGame }) => {
    const player = useSelector(playerSelector);
    const game = useSelector(gameSelector);
    const isHost = player?.isHost;

    return (
        <div className="game-settings-container">
            <div className="lobby-container-grid">
                <div className="settings-block">
                    <GameSettingsHeader keyword={'avatar'} />
                    <AvatarCreator />
                </div>
                <div className="settings-block">
                    <GameSettingsHeader keyword={'ownSettings'} />
                    <NamePicker />
                    {isHost && (
                        <div className="start-game-button-container">
                            <StartGameButton disableStartGameButton={disableStartGameButton} game={game} player={player} startGame={startGame} />
                        </div>
                    )}
                </div>
                <GameSettings options={game ? game.options : {}} gameID={game?.id} disabled={player?.isHost !== true} playerID={player?.id} />
                {isHost && (
                    <div
                        // This is here to occupy the same emount of space as the StartGameButton would
                        // (which is position absolute and at the bottom of the screen)
                        className="start-game-button-empty-space"
                    >
                        <StartGameButton disabled={true} />
                    </div>
                )}
            </div>
        </div>
    );
};

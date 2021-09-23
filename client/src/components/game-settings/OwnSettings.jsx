import React from 'react';
import { NamePicker } from '../../layouts/Game/phases/lobby/NamePicker';
import { AvatarCreator } from './AvatarCreator';
import { SettingsContainer } from '../settings/SettingsContainer';
import { StartGameButton } from '../../layouts/Game/phases/lobby/StartGameButton';

export const OwnSettings = (props) => {
    const { setPlayerAvatar, setPlayerName, isHost, disableStartGameButton, game, player, startGame } = props;
    return (
        <SettingsContainer className="settings-justify-between row fill">
            <SettingsContainer className="settings-justify-center column">
                <NamePicker setPlayerName={setPlayerName} />
                {isHost && (
                    <div className="start-game-button-container">
                        <StartGameButton disableStartGameButton={disableStartGameButton} game={game} player={player} startGame={startGame} />
                    </div>
                )}
            </SettingsContainer>
            <AvatarCreator setPlayerAvatar={setPlayerAvatar} />
        </SettingsContainer>
    );
};

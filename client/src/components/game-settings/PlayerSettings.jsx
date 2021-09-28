import React from 'react';
import { NamePicker } from '../../layouts/Game/phases/lobby/NamePicker';
import { AvatarCreator } from './avatar-creator/AvatarCreator';
import { StartGameButton } from '../../layouts/Game/phases/lobby/StartGameButton';

export const PlayerSettings = (props) => {
    const { isHost, disableStartGameButton, game, player, startGame } = props;

    return (
        <>
            <NamePicker />
            <AvatarCreator />
            {isHost && (
                <div className="start-game-button-container">
                    <StartGameButton disableStartGameButton={disableStartGameButton} game={game} player={player} startGame={startGame} />
                </div>
            )}
        </>
    );
};

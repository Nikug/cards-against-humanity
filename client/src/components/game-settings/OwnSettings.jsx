import React from 'react';
import { NamePicker } from '../../layouts/Game/phases/lobby/NamePicker';
import { AvatarCreator } from './AvatarCreator';

export const OwnSettings = ({ setPlayerAvatar, setPlayerName }) => {
    return (
        <div className={'justify-between column fill'}>
            <NamePicker setPlayerName={setPlayerName} />
            <AvatarCreator setPlayerAvatar={setPlayerAvatar} />
        </div>
    );
};

import React from 'react';
import { NamePicker } from '../../layouts/Game/phases/lobby/NamePicker';
import { AvatarCreator } from './AvatarCreator';
import { SettingsContainer } from '../settings/SettingsContainer';

export const OwnSettings = ({ setPlayerAvatar, setPlayerName }) => {
    return (
        <SettingsContainer className="justify-between row fill">
            <NamePicker setPlayerName={setPlayerName} />
            <AvatarCreator setPlayerAvatar={setPlayerAvatar} />
        </SettingsContainer>
    );
};

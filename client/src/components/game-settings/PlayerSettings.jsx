import React from 'react';
import { NamePicker } from '../../layouts/Game/phases/lobby/NamePicker';
import { AvatarCreator } from './avatar-creator/AvatarCreator';

export const PlayerSettings = () => {
    return (
        <>
            <NamePicker />
            <AvatarCreator />
        </>
    );
};

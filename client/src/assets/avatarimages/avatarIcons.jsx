import React from 'react';

import { ReactComponent as KoalaHat } from './KoalaEars.svg';
import { ReactComponent as KoalaEyes } from './KoalaEyes.svg';
import { ReactComponent as KoalaMouth } from './KoalaMouth.svg';
import { ReactComponent as MehHat } from './MehHat.svg';
import { ReactComponent as MehEyes } from './MehEyes.svg';
import { ReactComponent as MehMouth } from './MehMouth.svg';

import { ReactComponent as AvatarIcon } from './avatar.svg';

const hats = [null, <KoalaHat />, <MehHat />];
const eyes = [null, <KoalaEyes />, <MehEyes />];
const mouths = [null, <KoalaMouth />, <MehMouth />];

export const maxAvatarTypes = {
    // -1 because there is null option
    hatType: hats.length - 1,
    eyeType: eyes.length - 1,
    mouthType: mouths.length - 1,
};

const getHat = (type) => {
    return hats[type];
};

const getEyes = (type) => {
    return eyes[type];
};

const getMouth = (type) => {
    return mouths[type];
};

const AvatarOverLayImage = ({ children }) => {
    return <div className={'avatar-overlay-image'}>{children}</div>;
};

export const Avatar = () => {
    return (
        <div className={'avatar-background-image'}>
            <AvatarIcon />
        </div>
    );
};

export const Hat = ({ type }) => {
    return <AvatarOverLayImage>{getHat(type)}</AvatarOverLayImage>;
};

export const Eyes = ({ type }) => {
    return <AvatarOverLayImage>{getEyes(type)}</AvatarOverLayImage>;
};

export const Mouth = ({ type }) => {
    return <AvatarOverLayImage>{getMouth(type)}</AvatarOverLayImage>;
};

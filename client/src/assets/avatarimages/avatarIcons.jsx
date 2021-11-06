import React from 'react';

import { ReactComponent as KoalaHat } from './KoalaEars.svg';
import { ReactComponent as KoalaEyes } from './KoalaEyes.svg';
import { ReactComponent as KoalaMouth } from './KoalaMouth.svg';
import { ReactComponent as MehHat } from './MehHat.svg';
import { ReactComponent as MehEyes } from './MehEyes.svg';
import { ReactComponent as MehMouth } from './MehMouth.svg';

import avatarIcon from './koala.png';

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

const AvatarOverLayImageWrapper = ({ children }) => {
    return <div className={'avatar-overlay-image'}>{children}</div>;
};

export const Avatar = () => {
    return (
        <div className={'avatar-background-image'}>
            <img src={avatarIcon} />
        </div>
    );
};

export const Hat = ({ type }) => {
    return <AvatarOverLayImageWrapper>{getHat(type)}</AvatarOverLayImageWrapper>;
};

export const Eyes = ({ type }) => {
    return <AvatarOverLayImageWrapper>{getEyes(type)}</AvatarOverLayImageWrapper>;
};

export const Mouth = ({ type }) => {
    return <AvatarOverLayImageWrapper>{getMouth(type)}</AvatarOverLayImageWrapper>;
};

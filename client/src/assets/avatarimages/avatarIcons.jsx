import React from 'react';

/*
import { ReactComponent as KoalaHat } from './KoalaEars.svg';
import { ReactComponent as KoalaEyes } from './KoalaEyes.svg';
import { ReactComponent as KoalaMouth } from './KoalaMouth.svg';
import { ReactComponent as MehHat } from './MehHat.svg';
import { ReactComponent as MehEyes } from './MehEyes.svg';
import { ReactComponent as MehMouth } from './MehMouth.svg';


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

*/

import avatarBackground from './koala-512x512.png';
import hat1 from './hat-512x512.png';
import eyes1 from './eyes-512x512.png';
import mouth1 from './mouth-512x512.png';

const hats = [null, hat1];
const eyes = [null, eyes1];
const mouths = [null, mouth1];

export const maxAvatarTypes = {
    // -1 because of null option
    hatType: hats.length - 1,
    eyeType: eyes.length - 1,
    mouthType: mouths.length - 1,
};

const getHat = (type) => {
    return <img src={hats[type]} alt="avatar-hat" />;
};

const getEyes = (type) => {
    return <img src={eyes[type]} alt="avatar-eyes" />;
};

const getMouth = (type) => {
    return <img src={mouths[type]} alt="avatar-mouth" />;
};

const AvatarOverLayImageWrapper = ({ children }) => {
    return <div className={'avatar-overlay-image'}>{children}</div>;
};

export const Avatar = () => {
    return (
        <div className={'avatar-background-image'}>
            <img src={avatarBackground} alt="avatar" />
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

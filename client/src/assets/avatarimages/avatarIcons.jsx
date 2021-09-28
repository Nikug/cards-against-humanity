import React from 'react';

import { ReactComponent as KoalaHat } from './KoalaEars.svg';
import { ReactComponent as KoalaEyes } from './KoalaEyes.svg';
import { ReactComponent as KoalaMouth } from './KoalaMouth.svg';
import { ReactComponent as MehHat } from './MehHat.svg';
import { ReactComponent as MehEyes } from './MehEyes.svg';
import { ReactComponent as MehMouth } from './MehMouth.svg';

import { ReactComponent as AvatarIcon } from './avatar.svg';

export const maxAvatarTypes = {
    hatType: 2,
    eyeType: 2,
    mouthType: 2,
};

export const Avatar = () => {
    return (
        <div className={'avatar-background-image'}>
            <AvatarIcon />
        </div>
    );
};

export const Hat = ({ type }) => {
    const renderImage = (type) => {
        switch (type) {
            case 1:
                return <KoalaHat />;
            case 2:
                return <MehHat />;
            default:
                return null;
        }
    };

    return <div className={'avatar-overlay-image'}>{renderImage(type)}</div>;
};

export const Eyes = ({ type }) => {
    const renderImage = (type) => {
        switch (type) {
            case 1:
                return <KoalaEyes />;
            case 2:
                return <MehEyes />;
            default:
                return null;
        }
    };

    return <div className={'avatar-overlay-image'}>{renderImage(type)}</div>;
};

export const Mouth = ({ type }) => {
    const renderImage = (type) => {
        switch (type) {
            case 1:
                return <KoalaMouth />;
            case 2:
                return <MehMouth />;
            default:
                return null;
        }
    };

    return <div className={'avatar-overlay-image'}>{renderImage(type)}</div>;
};

import React from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { translateUnderWork } from '../../helpers/translation-helpers';
import Icon from '../general/Icon';
import { AvatarImage } from './AvatarImage';

const defaultAvatar = {
    hatType: 0,
    eyeType: 0,
    mouthType: 0,
    skinType: 0,
};

const maxAvatarTypes = {
    hatType: 2,
    eyeType: 2,
    mouthType: 2,
};

export const AvatarCreator = ({ setPlayerAvatar }) => {
    const { t } = useTranslation();
    const [currentAvatar, setCurrentAvatar] = useState(defaultAvatar);

    const changeAvatar = (type, dir) => {
        if (dir === 'next') {
            let newAvatar = Math.min(currentAvatar[type] + 1, maxAvatarTypes[type]);
            setCurrentAvatar((prevAvatar) => ({ ...prevAvatar, [type]: newAvatar }));
        } else if (dir === 'prev') {
            let newAvatar = Math.max(currentAvatar[type] - 1, 0);
            setCurrentAvatar((prevAvatar) => ({ ...prevAvatar, [type]: newAvatar }));
        } else {
            return;
        }
    };

    useEffect(() => {
        setPlayerAvatar(currentAvatar);
    }, [currentAvatar]);

    return (
        <div className="avatar-creator-container">
            <div className="text">{translateUnderWork('avatarCreator', t)}</div>

            <span className="hat-text">Hat: {currentAvatar.hatType} </span>
            <div className="arrow-left-1">
                <Icon name="arrow_back_ios" className="" onClick={() => changeAvatar('hatType', 'prev')} />
            </div>
            <span className="eyes-text">Eyes: {currentAvatar.eyeType}</span>
            <div className="arrow-left-2">
                <Icon name="arrow_back_ios" className="" onClick={() => changeAvatar('eyeType', 'prev')} />
            </div>
            <span className="mouth-text">Mouth: {currentAvatar.mouthType}</span>
            <div className="arrow-left-3">
                <Icon name="arrow_back_ios" className="" onClick={() => changeAvatar('mouthType', 'prev')} />
            </div>
            <div className="avatar">
                <AvatarImage
                    displayType="large"
                    hatType={currentAvatar.hatType}
                    eyeType={currentAvatar.eyeType}
                    mouthType={currentAvatar.mouthType}
                    skinType={currentAvatar.skinType}
                />
            </div>
            <div className="arrow-right-1">
                <Icon name="arrow_forward_ios" className="" onClick={() => changeAvatar('hatType', 'next')} />
            </div>
            <div className="arrow-right-2">
                <Icon name="arrow_forward_ios" className="" onClick={() => changeAvatar('eyeType', 'next')} />
            </div>
            <div className="arrow-right-3">
                <Icon name="arrow_forward_ios" className="" onClick={() => changeAvatar('mouthType', 'next')} />
            </div>
        </div>
    );
};

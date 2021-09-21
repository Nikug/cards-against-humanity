import React from 'react';
import { AvatarIcon, Hat, Mouth, Eyes } from '../../assets/avatarimages/avatarIcons.jsx';

export const AvatarImage = ({ hatNumber, eyeNumber, mouthNumber, displayType }) => {
    
    if (displayType === "playerWidget") {
        return (
            <div className="avatar-img-container">
                <AvatarIcon className="bgr-img-small" />
                {hatNumber > 0 && <Hat number={hatNumber} className="hat-img-small" />}
                {eyeNumber > 0 && <Eyes number={eyeNumber} className="eye-img-small" />}
                {mouthNumber > 0 && <Mouth number={mouthNumber} className="mouth-img-small" />}
            </div>
        );
    } else if ( displayType === "avatarCreator") {
        return (
            <div className="avatar-img-container">
                <AvatarIcon className="bgr-img" />
                {hatNumber > 0 && <Hat number={hatNumber} className="hat-img" />}
                {eyeNumber > 0 && <Eyes number={eyeNumber} className="eye-img" />}
                {mouthNumber > 0 && <Mouth number={mouthNumber} className="mouth-img" />}
            </div>
        );
    } else {
        return null;
    }
};

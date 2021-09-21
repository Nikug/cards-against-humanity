import React from 'react';
import { AvatarIcon, Hat, Mouth, Eyes } from '../../assets/avatarimages/avatarIcons.jsx';

export const AvatarImage = ({ hatType, eyeType, mouthType, displayType }) => {
    
    if (displayType === "playerWidget") {
        return (
            <div className="avatar-img-container">
                <AvatarIcon className="bgr-img-small" />
                {hatType > 0 && <Hat type={hatType} className="hat-img-small" />}
                {eyeType > 0 && <Eyes type={eyeType} className="eye-img-small" />}
                {mouthType > 0 && <Mouth type={mouthType} className="mouth-img-small" />}
            </div>
        );
    } else if ( displayType === "avatarCreator") {
        return (
            <div className="avatar-img-container">
                <AvatarIcon className="bgr-img" />
                {hatType > 0 && <Hat type={hatType} className="hat-img" />}
                {eyeType > 0 && <Eyes type={eyeType} className="eye-img" />}
                {mouthType > 0 && <Mouth type={mouthType} className="mouth-img" />}
            </div>
        );
    } else {
        return null;
    }
};

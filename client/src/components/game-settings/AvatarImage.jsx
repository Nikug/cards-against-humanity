import React from 'react';
import { AvatarIcon, Hat, Mouth, Eyes } from '../../assets/avatarimages/avatarIcons.jsx';

export const AvatarImage = ({ hatNumber, eyeNumber, mouthNumber }) => {
    return (
        <div className="avatar-img-container">
            <AvatarIcon className="bgr-img" />

            {hatNumber > 0 && <Hat number={hatNumber} className="hat-img" />}
            {eyeNumber > 0 && <Eyes number={eyeNumber} className="eye-img" />}
            {mouthNumber > 0 && <Mouth number={mouthNumber} className="mouth-img" />}
        </div>
    );
};

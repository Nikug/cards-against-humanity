import React from 'react';
import { AvatarIcon, Hat, Mouth, Eyes } from '../../assets/avatarimages/avatarIcons.jsx';

export const AvatarImage = ({ hatType, eyeType, mouthType, displayType }) => {
    const avatar = () => {
        return (
            <>
                <AvatarIcon className="avatar-background-image" />
                {hatType > 0 && <Hat type={hatType} className="avatar-overlay-image" />}
                {eyeType > 0 && <Eyes type={eyeType} className="avatar-overlay-image" />}
                {mouthType > 0 && <Mouth type={mouthType} className="avatar-overlay-image" />}
            </>
        );
    };

    if (displayType === 'small') {
        return <div className="avatar-img-container-small">{avatar()}</div>;
    } else if (displayType === 'large') {
        return <div className="avatar-img-container-large">{avatar()}</div>;
    } else {
        return null;
    }
};

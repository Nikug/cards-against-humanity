import React from 'react';
import { Avatar, Hat, Mouth, Eyes } from '../../assets/avatarimages/avatarIcons.jsx';

export const AvatarImage = ({ avatar, displaySize }) => {
    const { hatType, eyeType, mouthType } = avatar;

    const avatarLayout = () => {
        return (
            <>
                <Avatar className="avatar-background-image" />
                {hatType > 0 && <Hat type={hatType} className="avatar-overlay-image" />}
                {eyeType > 0 && <Eyes type={eyeType} className="avatar-overlay-image" />}
                {mouthType > 0 && <Mouth type={mouthType} className="avatar-overlay-image" />}
            </>
        );
    };

    switch (displaySize) {
        case 'small':
            return <div className="avatar-img-container-small">{avatarLayout()}</div>;
        case 'large':
            return <div className="avatar-img-container-large">{avatarLayout()}</div>;
        default:
            return null;
    }
};

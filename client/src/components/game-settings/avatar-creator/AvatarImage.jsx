import React from 'react';
import { Avatar, Hat, Mouth, Eyes } from '../../../assets/avatarimages/avatarIcons.jsx';
import { classNames } from '../../../helpers/classnames.js';

export const AvatarImage = ({ avatar, displaySize }) => {
    const { hatType, eyeType, mouthType } = avatar;

    return (
        <div className={classNames('avatar-img-container', { small: displaySize === 'small', large: displaySize === 'large' })}>
            <Avatar className="avatar-background-image" />
            {hatType > 0 && <Hat type={hatType} />}
            {eyeType > 0 && <Eyes type={eyeType} />}
            {mouthType > 0 && <Mouth type={mouthType} />}
        </div>
    );
};

import React from 'react';
import Icon from '../../general/Icon';
import { classNames } from '../../../helpers/classnames';
import { AVATAR_ARROW_DIRECTION } from './AvatarCreator';

export const AvatarCreatorArrow = ({ className, type, direction, callback }) => {
    const icon = direction === AVATAR_ARROW_DIRECTION.NEXT ? 'arrow_forward_ios' : 'arrow_back_ios';

    return (
        <div className={classNames(className)}>
            <Icon name={icon} className="button-icon active no-margin-right" onClick={() => callback(type, direction)} />
        </div>
    );
};

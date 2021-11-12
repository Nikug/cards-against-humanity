import React, { useMemo } from 'react';
import { classNames } from '../../helpers/classnames';
import { Toggle } from './Toggle';

export const ToggleWithText = ({ className, text, ...restProps }) => {
    return (
        <div className={classNames('toggle-with-text', className)}>
            <Toggle {...restProps} />
            <span>{text}</span>
        </div>
    );
};

import React, { useMemo, forwardRef } from 'react';
import { classNames } from '../../helpers/classnames';

import Icon from './Icon.jsx';

export const BUTTON_TYPES = {
    PRIMARY: 1,
    GREEN: 2,
};

const getClassNameString = (additionalClassname, disabled, fill, type) => {
    return classNames('button', additionalClassname, {
        fill: fill === 'fill',
        'fill-vertical': fill === 'fill-vertical',
        'fill-horizontal': fill === 'fill-horizontal',
        disabled,
        primary: type === BUTTON_TYPES.PRIMARY,
        green: type === BUTTON_TYPES.GREEN,
    });
};

const getOnclickFunction = (callback, callbackParams, disabled) => {
    return (e) => {
        if (disabled || !callback) {
            return;
        }

        callback(callbackParams);

        if (e.target.nodeName !== 'BUTTON') {
            e.target.parentElement.blur();
        }

        e.target.blur();
    };
};

const getButtonIcon = (icon, iconAfterText, noText) => {
    return <Icon name={icon} className={classNames('button-icon', { 'no-margin-right': noText || iconAfterText, 'after-text': iconAfterText })} />;
};

export const Button = forwardRef(({ additionalClassname, callback, callbackParams, disabled, fill, icon, iconPosition, text, type }, ref) => {
    const noText = text == null || text.length === 0;
    const iconAfterText = iconPosition === 'after';

    const classNameString = useMemo(() => getClassNameString(additionalClassname, disabled, fill, type), [additionalClassname, disabled, fill, type]);
    const onClickFunction = useMemo(() => getOnclickFunction(callback, callbackParams, disabled), [callback, callbackParams, disabled]);
    const buttonicon = useMemo(() => getButtonIcon(icon, iconAfterText, noText), [icon, iconAfterText, noText]);

    return (
        <button ref={ref} className={classNameString} onClick={onClickFunction}>
            {!iconAfterText && buttonicon}
            {text}
            {iconAfterText && buttonicon}
        </button>
    );
});

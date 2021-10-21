import React, { useMemo, forwardRef } from 'react';
import { classNames } from '../../helpers/classnames';
import { OnClickEventCallback } from '../../types/EventTypes';

import Icon from './Icon';

export const BUTTON_TYPES = {
    PRIMARY: 1,
    GREEN: 2,
};

type ButtonProps = {
    additionalClassname?: string;
    callback?: Function;
    callbackParams?: Object;
    disabled?: boolean;
    fill?: string;
    icon?: string;
    iconPosition?: string;
    text?: string;
    type?: 1 | 2
}

const getClassNameString = (additionalClassname: string, disabled: boolean, fill: string, type: 1 | 2) => {
    return classNames('button', additionalClassname, {
        fill: fill === 'fill',
        'fill-vertical': fill === 'fill-vertical',
        'fill-horizontal': fill === 'fill-horizontal',
        disabled,
        primary: type === BUTTON_TYPES.PRIMARY,
        green: type === BUTTON_TYPES.GREEN,
    });
};

const getOnclickFunction = (callback?: Function, callbackParams?: any, disabled?: boolean) => {
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

const getButtonIcon = (icon: string, iconAfterText: boolean, noText: boolean) => {
    return <Icon name={icon} className={classNames('button-icon', { 'no-margin-right': noText || iconAfterText, 'after-text': iconAfterText })} />;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ additionalClassname, callback, callbackParams, disabled, fill, icon, iconPosition, text, type }, ref) => {
    const noText = text == null || text.length === 0;
    const iconAfterText = iconPosition === 'after';

    const classNameString = useMemo(() => getClassNameString(additionalClassname, disabled, fill, type), [additionalClassname, disabled, fill, type]);
    const onClickFunction: OnClickEventCallback = useMemo(() => getOnclickFunction(callback, callbackParams, disabled), [callback, callbackParams, disabled]);
    const buttonicon = useMemo(() => getButtonIcon(icon, iconAfterText, noText), [icon, iconAfterText, noText]);

    return (
        <button ref={ref} className={classNameString} onClick={onClickFunction}>
            {!iconAfterText && buttonicon}
            {text}
            {iconAfterText && buttonicon}
        </button>
    );
});

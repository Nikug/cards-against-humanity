import React, { useMemo } from 'react';
import { classNames } from '../../helpers/classnames';
import Icon from '../general/Icon';

const getOnclickFunction = (onChangeCallback, field, currentValue) => {
    return (e) => {
        e.stopPropagation();

        if (field) {
            onChangeCallback({ field, value: !currentValue });
            return;
        }

        onChangeCallback(!currentValue);
    };
};

const getClassNameString = (disabled) => {
    return classNames('button-icon', {
        disabled,
        active: !disabled,
    });
};

export const Toggle = ({ currentValue, disabled, onChangeCallback, field }) => {
    const classNameString = useMemo(() => getClassNameString(disabled), [disabled]);
    const onClickFunction = useMemo(() => getOnclickFunction(onChangeCallback, field, currentValue), [onChangeCallback, field, currentValue]);
    const iconName = currentValue ? 'check_box' : 'check_box_outline_blank';

    return <Icon name={iconName} className={classNameString} disabled={disabled} onClick={onClickFunction} />;
};

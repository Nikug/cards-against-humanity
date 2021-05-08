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

const getClassNameString = (isDisabled) => {
    return classNames('button-icon', {
        disabled: isDisabled,
        active: !isDisabled,
    });
};

export const Toggle = ({ currentValue, isDisabled, onChangeCallback, field }) => {
    const classNameString = useMemo(() => getClassNameString(isDisabled), [isDisabled]);
    const onClickFunction = useMemo(() => getOnclickFunction(onChangeCallback, field, currentValue), [onChangeCallback, field, currentValue]);
    const iconName = currentValue ? 'check-box' : 'check_box_outline_blank';

    return <Icon name={iconName} className={classNameString} onClick={onClickFunction} />;
};

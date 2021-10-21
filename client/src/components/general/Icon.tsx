import React, { useMemo } from 'react';
import { classNames } from '../../helpers/classnames';
import { emptyFn, isNullOrUndefined } from '../../helpers/generalhelpers';
import { OnClickEventCallback } from '../../types/EventTypes';

type IconProps = {
    name: string;
    className?: string;
    color?: string;
    disabled?: boolean;
    onClick?: OnClickEventCallback;
}

const getIconClassNames = (className?: string, color?: string, onClick?: OnClickEventCallback, disabled?: boolean) => {
    return classNames('material-icons', className, color, { clickable: onClick != null, disabled });
};

export default function Icon({ name, className, color, disabled, onClick }: IconProps) {
    const classNameString = useMemo(() => getIconClassNames(className, color, onClick, disabled), [className, color, onClick, disabled]);

    return (
        <span className={classNameString} onClick={isNullOrUndefined(onClick) || disabled ? emptyFn : onClick}>
            {name}
        </span>
    );
}

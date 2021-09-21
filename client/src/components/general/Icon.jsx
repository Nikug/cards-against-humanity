import React, { useMemo } from 'react';
import { classNames } from '../../helpers/classnames';
import { emptyFn, isNullOrUndefined } from '../../helpers/generalhelpers';

const getIconClassNames = (className, color, onClick, disabled) => {
    return classNames('material-icons', className, color, { clickable: onClick != null, disabled });
};

export default function Icon({ name, className, color, disabled, onClick }) {
    if (name === 'skip_previous') {
        console.log({ disabled });
    }
    const classNameString = useMemo(() => getIconClassNames(className, color, onClick, disabled), [className, color, onClick, disabled]);

    return (
        <span className={classNameString} onClick={isNullOrUndefined(onClick) || disabled ? emptyFn : onClick}>
            {name}
        </span>
    );
}

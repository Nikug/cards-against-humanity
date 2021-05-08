import React, { useMemo } from 'react';
import { classNames } from '../helpers/classnames';
import { emptyFn, isNullOrUndefined } from '../helpers/generalhelpers';

const getIconClassNames = (className, color, onClick) => {
    return classNames('material-icons', className, color, { clickable: onClick != null });
};

export default function Icon({ name, className, color, onClick }) {
    const classNameString = useMemo(() => getIconClassNames(className, color, onClick), [className, color, onClick]);

    return (
        <span className={classNameString} onClick={isNullOrUndefined(onClick) ? emptyFn : onClick}>
            {name}
        </span>
    );
}

import React from 'react';
import { classNames } from '../../helpers/classnames.js';

export const Input = ({
    className,
    disabled,
    field,
    minSizeByChars = 8,
    onChange,
    onChangeParams = [],
    onKeyDown,
    onKeyDownParams = [],
    placeholder,
    type = 'text',
    value,
}) => {
    const handleOnChange = (e) => {
        if (onChange) {
            onChange(e, field, ...onChangeParams);
        }
    };

    const handleKeyDown = (e) => {
        if (onKeyDown) {
            onKeyDown(e, field, ...onKeyDownParams);
        }
    };

    return (
        <input
            className={classNames('text-input', className, { disabled })}
            onChange={handleOnChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder ?? ''}
            size={minSizeByChars}
            type={type}
            value={value}
        />
    );
};

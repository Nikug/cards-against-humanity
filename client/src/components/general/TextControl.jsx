import React from 'react';
import { classNames } from '../../helpers/classnames';
import { Button, BUTTON_TYPES } from './Button.jsx';
import { Input } from './Input';

export const TextControl = ({
    buttonClassName,
    buttonIcon,
    buttonOnClick,
    buttonOnClickParams = [],
    buttonText,
    buttonType,
    className,
    field,
    hasConfirm,
    inputClassName,
    disabled,
    onChange,
    onChangeParams,
    onKeyDown,
    onKeyDownParams,
    placeholder,
    type,
    value,
}) => {
    const handleButtonCLick = (e) => {
        if (buttonOnClick) {
            buttonOnClick(e, field, ...buttonOnClickParams);
        }
    };

    return (
        <div className={classNames('text-control', className)}>
            <Input
                className={inputClassName}
                disabled={disabled}
                field={field}
                onChange={onChange}
                onChangeParams={onChangeParams}
                onKeyDown={onKeyDown}
                onKeyDownParams={onKeyDownParams}
                placeholder={placeholder}
                type={type}
                value={value}
            />
            {hasConfirm && (
                <Button
                    callback={handleButtonCLick}
                    className={buttonClassName}
                    disabled={disabled}
                    fill={'fill-vertical'}
                    icon={buttonIcon || undefined}
                    text={buttonText}
                    type={buttonType ?? BUTTON_TYPES.PRIMARY}
                ></Button>
            )}
        </div>
    );
};

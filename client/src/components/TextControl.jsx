import React from "react";
import { Button, BUTTON_TYPES } from "./button";
import { Input } from "./Input";

export const TextControl = ({
    buttonIcon,
    buttonOnClick,
    buttonOnClickParams = [],
    buttonText,
    buttonType,
    className,
    field,
    hasConfirm,
    isDisabled,
    onChange,
    onChangeParams,
    onKeyDown,
    onKeyDownParams,
    placeholder,
    type,
    value,
}) => {
    const handleButtonCLick = (e) => {
        console.log("bbbb");
        if (buttonOnClick) {
            console.log({ buttonOnClickParams });
            buttonOnClick(e, field, ...buttonOnClickParams);
        }
    };

    return (
        <div className="text-control">
            <Input
                className={className}
                disabled={isDisabled}
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
                    disabled={isDisabled}
                    icon={buttonIcon || undefined}
                    text={buttonText}
                    type={buttonType ?? BUTTON_TYPES.PRIMARY}
                ></Button>
            )}
        </div>
    );
};

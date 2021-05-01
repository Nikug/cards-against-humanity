import React from "react";
import { classNames } from "../helpers/classnames";
import { Button, BUTTON_TYPES } from "./button";

export const TextControl = ({
    buttonIcon,
    buttonOnClick,
    buttonText,
    buttonType,
    className,
    field,
    hasConfirm,
    onChange,
    onKeyDown,
    placeholder,
    type,
    value,
}) => {
    return (
        <div className="text-control">
            <input
                type={type ?? "text"}
                className={classNames("text-input", className)}
                placeholder={placeholder ?? ""}
                value={value}
                onChange={(e) => onChange(e, field)}
                onKeyDown={(e) => onKeyDown(e, field)}
            />
            {hasConfirm && (
                <Button
                    text={buttonText}
                    type={buttonType ?? BUTTON_TYPES.PRIMARY}
                    callback={(e) => buttonOnClick(e, field)}
                    icon={buttonIcon || undefined}
                ></Button>
            )}
        </div>
    );
};

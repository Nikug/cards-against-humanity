import React from "react";

import Icon from "./icon";

export const BUTTON_TYPES = {
    PRIMARY: 1,
    GREEN: 2,
};

export const Button = React.forwardRef((props, ref) => {
    const {
        text,
        type,
        icon,
        iconPosition,
        callback,
        callbackParams,
        additionalClassname,
        disabled,
        fill,
    } = props;
    const noText = text === undefined || text === null || text.length === 0;

    return (
        <>
            <button
                ref={ref}
                className={`button ${fill ? "fill" : ""} ${
                    disabled ? "disabled" : ""
                } ${additionalClassname ? additionalClassname : ""} ${
                    type === BUTTON_TYPES.PRIMARY
                        ? "primary"
                        : type === BUTTON_TYPES.GREEN
                        ? "green"
                        : ""
                }`}
                onClick={(e) => {
                    if (disabled || !callback) {
                        return;
                    }
                    callback(callbackParams);
                    if (e.target.nodeName !== "BUTTON") {
                        e.target.parentElement.blur();
                    }
                    e.target.blur();
                }}
            >
                {icon && iconPosition !== "after" && (
                    <Icon
                        name={icon}
                        className={`button-icon ${
                            noText ? "no-margin-right" : ""
                        }`}
                    />
                )}
                {text}
                {icon && iconPosition === "after" && (
                    <Icon name={icon} className={`button-icon after-text`} />
                )}
            </button>
        </>
    );
});
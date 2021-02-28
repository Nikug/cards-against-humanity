import React from "react";

import "../styles/button.scss";

import Icon from "./icon";

export const BUTTON_TYPES = {
    PRIMARY: 1,
    GREEN: 2,
};

export default function Button(props) {
    const {
        text,
        type,
        icon,
        iconPosition,
        callback,
        callbackParams,
        additionalClassname,
        disabled,
    } = props;
    const noText = text === undefined || text === null || text.length === 0;

    return (
        <>
            <button
                className={`button ${disabled ? "disabled" : ""} ${
                    additionalClassname ? additionalClassname : ""
                } ${
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
}

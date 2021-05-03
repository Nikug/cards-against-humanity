import React from "react";
import { classNames } from "../helpers/classnames";

import Icon from "./icon";

export const BUTTON_TYPES = {
    PRIMARY: 1,
    GREEN: 2,
};

export const Button = React.forwardRef((props, ref) => {
    const {
        additionalClassname,
        callback,
        callbackParams,
        disabled,
        fill,
        icon,
        iconPosition,
        text,
        type,
    } = props;
    const noText = text === undefined || text === null || text.length === 0;

    return (
        <button
            ref={ref}
            className={classNames("button", additionalClassname, {
                fill,
                disabled,
                primary: type === BUTTON_TYPES.PRIMARY,
                green: type === BUTTON_TYPES.GREEN,
            })}
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
                    className={classNames("button-icon", {
                        "no-margin-right": noText,
                    })}
                />
            )}
            {text}
            {icon && iconPosition === "after" && (
                <Icon
                    name={icon}
                    className={classNames("button-icon", "after-text")}
                />
            )}
        </button>
    );
});

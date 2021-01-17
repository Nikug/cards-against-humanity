import React, { useState, useEffect } from "react";
import { isNullOrUndefined } from "../../helpers/generalhelpers";
import Icon from "../icon";

export const NOTIFICATION_TYPES = {
    DEFAULT: "default",
    ERROR: "error",
    SUCCESS: "success",
};

export const Notification = (props) => {
    const { text, type, icon } = props;
    const [hidden, setHidden] = useState(false);

    const hide = () => {
        console.log("hide");
        setHidden(true);
    };

    const show = () => {
        console.log("show");
        setHidden(false);
    };

    useEffect(() => {
        show();
    }, [props]);

    return (
        <div
            className={`notification ${isNullOrUndefined(type) ? "" : type} ${
                hidden ? "hide" : ""
            }`}
        >
            <div className="icon-and-text">
                {icon && (
                    <Icon
                        name={"info"}
                        color={"blue"}
                        className={"type-icon"}
                    />
                )}
                {text}
            </div>
            <div className="dismiss-btn">
                <Icon name={"highlight_off"} color={"white"} onClick={hide} />
            </div>
        </div>
    );
};

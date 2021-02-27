import React, { useState } from "react";
import "./../../styles/gamesettings.scss";
import { CONTROL_TYPES, Setting } from "./setting";
import { emptyFn } from "../../helpers/generalhelpers";
import Icon from "../icon";

export const CollabsibelSettingsSection = ({
    content,
    title,
    isDisabled,
    options,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const iconClassnames = "md-36 icon-margin-right";

    const toggle = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="collabsible-settings-section">
            <Setting
                text={"Aikarajat"}
                controlType={CONTROL_TYPES.custom}
                customControl={
                    <Icon
                        name={isOpen ? "expand_less" : "expand_more"}
                        onClick={toggle}
                    />
                }
                onChangeCallback={emptyFn}
                icon={{
                    name: "hourglass_bottom",
                    className: iconClassnames,
                    isDisabled: isDisabled,
                }}
                isDisabled={isDisabled}
                className="title"
            />
            {isOpen && content}
        </div>
    );
};

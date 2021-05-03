import React, { useState } from "react";
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

    const { titleText, titleIconName } = title;

    const toggle = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="collabsible-settings-section">
            <Setting
                text={titleText}
                controlType={CONTROL_TYPES.custom}
                customControl={
                    <Icon name={isOpen ? "expand_less" : "expand_more"} />
                }
                onChangeCallback={emptyFn}
                icon={{
                    name: titleIconName,
                    className: iconClassnames,
                    isDisabled: isDisabled,
                }}
                isDisabled={isDisabled}
                className="title"
                onClick={toggle}
            />
            {isOpen && content}
        </div>
    );
};

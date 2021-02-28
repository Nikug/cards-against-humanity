import React from "react";
import Button, { BUTTON_TYPES } from "../../../components/button";

export const ActionButtonRow = ({ buttons }) => {
    if (!buttons) {
        return null;
    }

    const content = [];

    for (let i = 0, len = buttons.length; i < len; i++) {
        const { icon, text, callback, type = BUTTON_TYPES.PRIMARY } = buttons[
            i
        ];

        content.push(
            <Button callback={callback} text={text} icon={icon} type={type} />
        );
    }
    return <div className="action-button-row">{content}</div>;
};

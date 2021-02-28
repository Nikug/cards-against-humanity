import React from "react";
import Icon from "../../icon";

export const Toggle = ({ currentValue, isDisabled, onChangeCallback }) => {
    const onClick = (event) => {
        event.stopPropagation();

        onChangeCallback(!currentValue);
    };

    return (
        <Icon
            name={`${currentValue ? "check_box" : "check_box_outline_blank"}`}
            className="md-36 button-icon"
            color={isDisabled ? "disabled" : "active"}
            onClick={onClick}
        />
    );
};

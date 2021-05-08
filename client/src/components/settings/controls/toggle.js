import React from "react";
import Icon from "../../icon";

export const Toggle = ({
    currentValue,
    isDisabled,
    onChangeCallback,
    field,
}) => {
    const onClick = (event) => {
        event.stopPropagation();

        if (field) {
            onChangeCallback({ field, value: !currentValue });
            return;
        }

        onChangeCallback(!currentValue);
    };

    return (
        <Icon
            name={`${currentValue ? "check_box" : "check_box_outline_blank"}`}
            className="button-icon"
            color={isDisabled ? "disabled" : "active"}
            onClick={onClick}
        />
    );
};

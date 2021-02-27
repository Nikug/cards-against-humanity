import React from "react";
import Icon from "../../icon";

export const Toggle = ({ currentValue, isDisabled, onChangeCallback }) => {
    return (
        <Icon
            name={`${
                currentValue === true ? "check_box" : "check_box_outline_blank"
            }`}
            className="md-36 button-icon"
            color={isDisabled ? "disabled" : "active"}
            onClick={onChangeCallback}
        />
    );
};

import React, { useState, useEffect } from "react";
import "./../../styles/gamesettings.scss";
import "./../../styles/input.scss";

import Icon from "./../icon";
import Button from "./../button";
import { BUTTON_TYPES } from "./../button";
import { Toggle } from "./controls/toggle";

export const CONTROL_TYPES = {
    toggle: "toggle",
    number: "number",
    text: "text",
    textWithConfirm: "textWithConfirm",
    custom: "custom",
};

export const Setting = (props) => {
    const [inputText, setInputText] = useState("");

    useEffect(() => {
        if (props.DEV_CARD_PACK_AUTOFILL === true) {
            const cardpackId = "U4nL88ujS" || "qM1V1IaYBE";
            setInputText(cardpackId);
        }
    }, []);

    const renderNumberSelect = (currentValue, isDisabled, onChangeCallback) => {
        return (
            <div className="number-control">
                <Icon
                    name="arrow_back_ios"
                    className="md-24 button-icon"
                    color={isDisabled ? "disabled" : "active"}
                    onClick={() => onChangeCallback(false)}
                />
                <span className="number">{currentValue}</span>
                <Icon
                    name="arrow_forward_ios"
                    className="md-24 button-icon"
                    color={isDisabled ? "disabled" : "active"}
                    onClick={() => onChangeCallback(true)}
                />
            </div>
        );
    };

    const renderTextField = (
        currentValue = inputText,
        isDisabled,
        onChangeCallback,
        placeholderText,
        hasConfirm = false
    ) => {
        return (
            <div className="text-control">
                <input
                    type="text"
                    className="text-input"
                    placeholder={placeholderText}
                    value={currentValue}
                    onChange={
                        hasConfirm
                            ? (e) => handleKeyDown(e)
                            : (e) => handleTextFieldChange(e, onChangeCallback)
                    }
                />
                {hasConfirm && (
                    <Button
                        type={BUTTON_TYPES.PRIMARY}
                        callback={() =>
                            handleTextFieldChange(null, onChangeCallback)
                        }
                        icon={props.customButtonIcon || "add_circle_outline"}
                    ></Button>
                )}
            </div>
        );
    };

    const handleKeyDown = (event) => {
        event.preventDefault();

        const charLimit = props.charLimit;
        const newInput = event.target.value.slice(0, charLimit);

        setInputText(newInput);
    };

    const handleTextFieldChange = (event, changeCallback) => {
        if (event === null) {
            changeCallback(inputText);
            setInputText("");
        } else {
            event.preventDefault();
            changeCallback(event.target.value);
        }
    };

    const renderIcon = (icon) => {
        const { name, className, color, onClick, isDisabled } = icon;

        return (
            <Icon
                name={name}
                className={`${className ? className : ""} ${
                    isDisabled ? "disabled" : ""
                }`}
                color={color}
                onClick={onClick}
            />
        );
    };

    const renderControl = (
        controlType,
        currentValue,
        isDisabled,
        onChangeCallback,
        placeholderText
    ) => {
        switch (controlType) {
            case CONTROL_TYPES.toggle:
                return (
                    <Toggle
                        currentValue={currentValue}
                        isDisabled={isDisabled}
                        onChangeCallback={onChangeCallback}
                    />
                );
            case CONTROL_TYPES.number:
                return renderNumberSelect(
                    currentValue,
                    isDisabled,
                    onChangeCallback
                );
            case CONTROL_TYPES.text:
                return renderTextField(
                    currentValue,
                    isDisabled,
                    onChangeCallback,
                    placeholderText,
                    false
                );
            case CONTROL_TYPES.textWithConfirm:
                return renderTextField(
                    currentValue,
                    isDisabled,
                    onChangeCallback,
                    placeholderText,
                    true
                );
            default:
                break;
        }
    };

    const changeCallback = (value) => {
        const field = props.field;
        const callbackFunction = props.onChangeCallback;

        if (!callbackFunction) return;

        if (field) {
            callbackFunction({ value: value, field: field });
        }

        return callbackFunction(value);
    };

    const {
        icon,
        text,
        toolTipText,
        controlType,
        currentValue,
        isDisabled,
        onChangeCallback,
        customControl,
        placeholderText,
        className,
    } = props;
    let renderedIcon;

    if (icon !== undefined) {
        renderedIcon = renderIcon(icon);
    }

    const control =
        controlType === CONTROL_TYPES.custom
            ? customControl
            : renderControl(
                  controlType,
                  currentValue,
                  isDisabled,
                  changeCallback,
                  placeholderText
              );

    return (
        <div className={`setting ${className ? className : ""}`}>
            <div className="icon-and-text">
                {icon && (
                    <span className="tooltip">
                        {toolTipText && (
                            <span className="tooltiptext">{toolTipText}</span>
                        )}
                        {renderedIcon}
                    </span>
                )}
                {text}
            </div>
            <div className="control">{control}</div>
        </div>
    );
};

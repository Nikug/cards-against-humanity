import React, { useState, useEffect } from 'react';

import Icon from './../general/Icon';
import { Toggle } from './../general/Toggle';
import { TextControl } from '../general/TextControl';
import { classNames } from '../../helpers/classnames';

export const CONTROL_TYPES = {
    toggle: 'toggle',
    number: 'number',
    text: 'text',
    textWithConfirm: 'textWithConfirm',
    custom: 'custom',
};

export const Setting = ({
    DEV_CARD_PACK_AUTOFILL,
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
    onClick,
    field,
    customButtonIcon,
    charLimit,
}) => {
    const [inputText, setInputText] = useState('');

    useEffect(() => {
        if (DEV_CARD_PACK_AUTOFILL === true && !isDisabled) {
            const cardpackId = 'U4nL88ujS' || 'qM1V1IaYBE';
            setInputText(cardpackId);
        }
    }, []);

    const renderNumberSelect = (currentValue, isDisabled, onChangeCallback, field) => {
        const showAsDisabled = isDisabled || currentValue === null;

        const onIncrease = () => {
            if (field) {
                onChangeCallback({ field, value: 'increase' });
                return;
            }

            onChangeCallback('increase');
        };

        const onDecrease = () => {
            if (field) {
                onChangeCallback({ field, value: 'decrease' });
                return;
            }

            onChangeCallback('decrease');
        };

        return (
            <div className="number-control">
                <Icon name="arrow_back_ios" className="button-icon" color={showAsDisabled ? 'disabled' : 'active'} onClick={onDecrease} />
                <span className={`number ${currentValue > 99 ? 'three-numbers' : ''}`}>{currentValue}</span>
                <Icon name="arrow_forward_ios" className="button-icon" color={showAsDisabled ? 'disabled' : 'active'} onClick={onIncrease} />
            </div>
        );
    };

    const renderTextField = (currentValue = inputText, isDisabled, onChangeCallback, field, placeholderText, hasConfirm = false) => {
        return (
            <TextControl
                buttonIcon={customButtonIcon || 'add_circle_outline'}
                buttonOnClick={handleTextFieldChange}
                buttonOnClickParams={[onChangeCallback]}
                field={field}
                hasConfirm={hasConfirm}
                isDisabled={isDisabled}
                onChange={hasConfirm ? handleKeyDown : handleTextFieldChange}
                onChangeParams={hasConfirm ? [] : [onChangeCallback]}
                onKeyDown={hasConfirm ? null : handleKeyDown}
                placeholder={placeholderText}
                value={currentValue}
            />
        );
    };

    const handleKeyDown = (event, field) => {
        event.preventDefault();

        const newInput = event.target.value.slice(0, charLimit);

        setInputText(newInput);
    };

    const handleTextFieldChange = (event, field, changeCallback) => {
        if (!event) {
            if (field) {
                changeCallback({ field, value: inputText });
            } else {
                changeCallback(inputText);
            }

            setInputText('');
        } else {
            event.preventDefault();

            if (field) {
                changeCallback({ field, value: event.target.value });
            }
            changeCallback(event.target.value);
        }
    };

    const renderIcon = (icon) => {
        const { name, className, color, onClick, isDisabled } = icon;

        return <Icon name={name} className={`${className ? className : ''} ${isDisabled ? 'disabled' : ''}`} color={color} onClick={onClick} />;
    };

    const renderMultipleControls = (controls, currentValue, isDisabled, onChangeCallback, placeholderText) => {
        const renderedControls = [];

        for (let i = 0, len = controls.length; i < len; i++) {
            renderedControls.push(
                <div key={i}>{renderControl(controls[i], currentValue?.[i], isDisabled, onChangeCallback, placeholderText, field?.[i])}</div>
            );
        }

        return renderedControls;
    };

    const renderControl = (controlType, currentValue, isDisabled, onChangeCallback, placeholderText, field) => {
        if (Array.isArray(controlType)) {
            return renderMultipleControls(controlType, currentValue, isDisabled, onChangeCallback, placeholderText);
        }

        switch (controlType) {
            case CONTROL_TYPES.toggle:
                return <Toggle currentValue={currentValue} isDisabled={isDisabled} onChangeCallback={onChangeCallback} field={field} />;
            case CONTROL_TYPES.number:
                return renderNumberSelect(currentValue, isDisabled, onChangeCallback, field);
            case CONTROL_TYPES.text:
                return renderTextField(currentValue, isDisabled, onChangeCallback, field, placeholderText, false);
            case CONTROL_TYPES.textWithConfirm:
                return renderTextField(currentValue, isDisabled, onChangeCallback, field, placeholderText, true);
            default:
                break;
        }
    };

    const changeCallback = (param) => {
        const callbackFunction = onChangeCallback;

        if (!callbackFunction) return;

        callbackFunction(param);
    };

    let renderedIcon;

    if (icon !== undefined) {
        renderedIcon = renderIcon(icon);
    }

    const control =
        controlType === CONTROL_TYPES.custom ? customControl : renderControl(controlType, currentValue, isDisabled, changeCallback, placeholderText);

    return (
        <div
            className={classNames('setting', className, {
                'text-control': controlType === CONTROL_TYPES.textWithConfirm || controlType === CONTROL_TYPES.text,
            })}
            onClick={onClick}
        >
            <div className="icon-and-text">
                {icon && (
                    <span className="tooltip">
                        {toolTipText && <span className="tooltiptext">{toolTipText}</span>}
                        {renderedIcon}
                    </span>
                )}
                {text}
            </div>
            <div className={classNames('control')}>{control}</div>
        </div>
    );
};

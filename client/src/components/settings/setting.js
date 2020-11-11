import React, {Component} from 'react';
import './../../styles/gamesettings.scss'
import './../../styles/input.scss'

import Icon from './../icon';
import Button from './../button'
import {BUTTON_TYPES} from './../button'
import { emptyFn } from '../../helpers/generalhelpers';

export const CONTROL_TYPES = {
    toggle: 'toggle',
    number: 'number',
    text: 'text',
    textWithConfirm: 'textWithConfirm',
    custom: 'custom'
}

export class Setting extends Component {
    constructor(props) {
        super(props);

        this.state = {
            inputText: ''
        }
    }
    renderToggle(currentValue, isDisabled, onChangeCallback) {
        return (
            <Icon 
            name={`${currentValue === true ? 'check_box' : 'check_box_outline_blank'}`} 
            className='md-36 button-icon'
            color={isDisabled ? 'disabled' : 'active'}
            onClick={onChangeCallback}
            />
        );
    }

    renderNumberSelect(currentValue, isDisabled, onChangeCallback) {
        return (
            <div className="number-control">
                <Icon 
                name="arrow_back_ios"
                className='md-24 button-icon'
                color={isDisabled ? 'disabled' : 'active'}
                onClick={() => onChangeCallback(false)}
                />
                <span className="number">
                    {currentValue}
                </span>
                <Icon 
                name="arrow_forward_ios" 
                className='md-24 button-icon'
                color={isDisabled ? 'disabled' : 'active'}
                onClick={() => onChangeCallback(true)}
                />
            </div>
        );
    }

    renderTextField(currentValue, isDisabled, onChangeCallback, placeholderText, hasConfirm = false) {
        return (
            <div className="text-control">
                <input type="text" className="text-input" placeholder={placeholderText} value={currentValue} onChange={hasConfirm ? (e) => this.handleKeyDown(e) : (e) => this.handleTextFieldChange(e, onChangeCallback)}/> 
                {hasConfirm && <Button type={BUTTON_TYPES.PRIMARY} callback={() => this.handleTextFieldChange(null, onChangeCallback)} icon="add_circle_outline"></Button>}
            </div>
        );
    }

    handleKeyDown(event) {
        this.setState({inputText: event.target.value});
    }

    handleTextFieldChange(event, changeCallback) {
        if (event === null) {
            changeCallback(this.state.inputText);
        } else {
            changeCallback(event.target.value);
        }
        
    }

    renderIcon(icon) {
        const {name, className, color, onClick, isDisabled} = icon;

        return (
            <Icon name={name} className={`${className ? className : ''} ${isDisabled ? 'disabled' : ''}`} color={color} onClick={onClick} />
        );
    }

    renderControl(controlType, currentValue, isDisabled, onChangeCallback, placeholderText) {
        switch(controlType) {
            case CONTROL_TYPES.toggle:
                return this.renderToggle(currentValue, isDisabled, onChangeCallback);
                break;
            case CONTROL_TYPES.number:
                return this.renderNumberSelect(currentValue, isDisabled, onChangeCallback)
                break;
            case CONTROL_TYPES.text:
                return this.renderTextField(currentValue, isDisabled, onChangeCallback, placeholderText, false);
                break;
            case CONTROL_TYPES.textWithConfirm:
                return this.renderTextField(currentValue, isDisabled, onChangeCallback, placeholderText, true);
                break;
            default:
                break;
        }
    }

    render() {
        const {icon, text, toolTipText, controlType, currentValue, isDisabled, onChangeCallback, customControl, placeholderText} = this.props;
        let renderedIcon;

        if (icon !== undefined) {
            renderedIcon = this.renderIcon(icon);
        }

        const control = controlType === CONTROL_TYPES.custom ? customControl : this.renderControl(controlType, currentValue, isDisabled, onChangeCallback, placeholderText);

        return (
            <div className="setting">
                <div className="icon-and-text">
                
                    {icon && <span className="tooltip">{toolTipText && <span className="tooltiptext">{toolTipText}</span>}{renderedIcon}</span>}
                    {text}
                </div>
                <div className="control">
                    {control}
                </div>
            </div>
        );
    }
}

import React, {Component} from 'react';
import './../../styles/gamesettings.scss'

import Icon from './../icon';

export const CONTROL_TYPES = {
    toggle: 'toggle',
    number: 'number',
    text: 'text',
    custom: 'custom'
}

export class Setting extends Component {
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

    renderTextField(currentValue, isDisabled, onChangeCallback) {
        return (
            <span>number select</span>
        );
    }

    renderIcon(icon) {
        const {name, className, color, onClick, isDisabled} = icon;

        return (
            <Icon name={name} className={`${className ? className : ''} ${isDisabled ? 'disabled' : ''}`} color={color} onClick={onClick} />
        );
    }

    renderControl(controlType, currentValue, isDisabled, onChangeCallback) {
        switch(controlType) {
            case CONTROL_TYPES.toggle:
                return this.renderToggle(currentValue, isDisabled, onChangeCallback);
                break;
            case CONTROL_TYPES.number:
                return this.renderNumberSelect(currentValue, isDisabled, onChangeCallback)
                break;
            case CONTROL_TYPES.text:
                return "text";
                break;
            default:
                break;
        }
    }

    render() {
        const {icon, text, controlType, currentValue, isDisabled, onChangeCallback, customControl} = this.props;
        let renderedIcon;

        if (icon !== undefined) {
            renderedIcon = this.renderIcon(icon);
        }

        const control = controlType === CONTROL_TYPES.custom ? customControl : this.renderControl(controlType, currentValue, isDisabled, onChangeCallback);

        return (
            <div className="setting">
                <div className="icon-and-text">
                    {icon && renderedIcon}
                    {text}
                </div>
                <div className="control">
                    {control}
                </div>
            </div>
        );
    }
}

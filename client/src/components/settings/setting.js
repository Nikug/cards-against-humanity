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
    renderToggle(currentValue, onChangeCallback) {
        return (
            <Icon 
            name={`${currentValue === true ? 'check_box' : 'check_box_outline_blank'}`} 
            className='md-36 button-icon'
            onClick={onChangeCallback}
            />
        );
    }

    renderNumberSelect(currentValue) {
        return (
            <span>number select</span>
        );
    }

    renderTextField(currentValue) {
        return (
            <span>number select</span>
        );
    }

    renderIcon(icon) {
        const {name, className, color, onClick} = icon;

        return (
            <Icon name={name} className={className} color={color} onClick={onClick} />
        );
    }

    renderControl(controlType, currentValue, onChangeCallback) {
        switch(controlType) {
            case CONTROL_TYPES.toggle:
                return this.renderToggle(currentValue, onChangeCallback);
                break;
            case CONTROL_TYPES.number:
                return "number";
                break;
            case CONTROL_TYPES.text:
                return "text";
                break;
            case CONTROL_TYPES.custom:
                return "custom";
                break;
            default:
                break;
        }
    }

    render() {
        const {icon, text, controlType, currentValue, onChangeCallback} = this.props;
        let renderedIcon;

        if (icon !== undefined) {
            renderedIcon = this.renderIcon(icon);
        }

        const control = this.renderControl(controlType, currentValue, onChangeCallback);

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

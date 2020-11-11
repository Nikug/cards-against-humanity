import React from 'react'

import "../styles/button.scss";

import Icon from './icon';

export const BUTTON_TYPES = {
    PRIMARY: 1
}

export default function Button(props) {
    const {text, type, icon, callback, callbackParams} = props;
    const noText = text === undefined || text === null || text.length === 0;

    return (
        <>
            <button
                className={`button ${type === 1 ? 'primary' : ''}`}
                onClick={() => callback(callbackParams)} 
            >
                {icon && <Icon name={icon} className={`button-icon ${noText ? 'no-margin-right' : ''}`}/>}
                {text}
            </button>
        </>
    );
}
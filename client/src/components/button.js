import React from 'react'

import "../styles/button.scss";

export const BUTTON_TYPES = {
    PRIMARY: 1
}

export default function Button(props) {
    const {text, type, callback, callbackParams} = props;
    return (
        <input 
            type="button" 
            value={text}
            className={`button ${type === 1 ? 'primary' : ''}`}
            onClick={() => callback(callbackParams)} 
        />
    );
}
import React from 'react';
import { Button } from '../general/Button.tsx';

export const GameSettingsQuickSelect = ({ buttonsProps }) => {
    if (!(buttonsProps && buttonsProps.length)) {
        return null;
    }
    const buttons = [];

    for (let i = 0, len = buttonsProps.length; i < len; i++) {
        const button = buttonsProps[i];

        buttons.push(<Button key={i} {...button} />);
    }

    return <div className="game-settings-quick-select">{buttons}</div>;
};

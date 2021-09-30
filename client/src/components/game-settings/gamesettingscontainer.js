import React from 'react';
import { classNames } from '../../helpers/classnames';
import { GameSettings } from './GameSettings';

export const GameSettingsContainer = (props) => {
    return (
        <div
            className={classNames('game-settings-container', {
                disabled: props?.disabled,
            })}
        >
            <div>
                <GameSettings {...props} />
            </div>
        </div>
    );
};

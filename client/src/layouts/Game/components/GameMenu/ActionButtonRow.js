import { a, useTrail } from 'react-spring';

import { Button } from '../../../../components/general/Button.jsx';
import React from 'react';
import { classNames } from '../../../../helpers/classnames.js';
import { Tooltip } from '../../../../components/popovers/Tooltip.jsx';

export const BUTTON_ROW_DIRECTION = {
    ROW: 'row',
    COLUMN: 'column',
};

export const ActionButtonRow = ({ buttons, direction = BUTTON_ROW_DIRECTION.ROW }) => {
    const renderedButtons = [];

    for (let i = 0, len = buttons.length; i < len; i++) {
        const buttonProps = buttons[i];
        const tooltip = buttonProps?.tooltip;

        if (tooltip) {
            renderedButtons.push(
                <Tooltip content={tooltip} tippyProps={{ placement: 'left' }}>
                    <Button key={i} {...buttonProps} fill={true} />
                </Tooltip>
            );
        } else if (buttonProps) {
            renderedButtons.push(<Button key={i} {...buttonProps} fill={true} />);
        }
    }

    const trail = useTrail(renderedButtons.length, {
        //from: { transform: "translate3d(-20px,0,0)" },
        //to: {
        //    transform: "translate3d(20px,0,0)",
        //},
    });

    if (!trail || trail.length < 1) {
        return null;
    }

    return (
        <div className={classNames('button-row-container', { column: direction === BUTTON_ROW_DIRECTION.COLUMN })}>
            {trail.map((styles, index) => (
                <a.span key={index} style={styles}>
                    {renderedButtons[index]}
                </a.span>
            ))}
        </div>
    );
};

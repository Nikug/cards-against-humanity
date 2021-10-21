import { Button } from '../../../../components/general/Button.tsx';
import React from 'react';
import { classNames } from '../../../../helpers/classnames.js';
import { Tooltip } from '../../../../components/popovers/Tooltip.jsx';

export const BUTTON_ROW_DIRECTION = {
    ROW: 'row',
    COLUMN: 'column',
};

export const ActionButtonRow = ({ buttons, direction = BUTTON_ROW_DIRECTION.ROW, wrap }) => {
    const renderedButtons = [];

    for (let i = 0, len = buttons.length; i < len; i++) {
        const buttonProps = buttons[i];
        const tooltip = buttonProps?.tooltip;

        if (buttonProps?.custom) {
            renderedButtons.push(buttonProps?.component);

            continue;
        }

        if (tooltip) {
            renderedButtons.push(
                <Tooltip content={tooltip} key={i} tippyProps={{ placement: 'left' }}>
                    <Button key={i} {...buttonProps} fill={true} />
                </Tooltip>
            );
        } else if (buttonProps) {
            renderedButtons.push(<Button key={i} {...buttonProps} fill={true} />);
        }
    }

    return <div className={classNames('button-row-container', { column: direction === BUTTON_ROW_DIRECTION.COLUMN, wrap })}>{renderedButtons}</div>;
};

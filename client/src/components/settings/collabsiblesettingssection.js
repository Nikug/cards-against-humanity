import React, { useState } from 'react';
import { CONTROL_TYPES, Setting } from './setting';
import { emptyFn } from '../../helpers/generalhelpers';
import Icon from '../general/Icon';

export const CollabsibelSettingsSection = ({ content, disabled, title }) => {
    const [isOpen, setIsOpen] = useState(false);
    const iconClassnames = 'icon-margin-right';

    const { titleText, titleIconName } = title;

    const toggle = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="collabsible-settings-section">
            <Setting
                className="title"
                controlType={CONTROL_TYPES.custom}
                customControl={<Icon name={isOpen ? 'expand_less' : 'expand_more'} />}
                icon={{ name: titleIconName, className: iconClassnames, disabled }}
                disabled={disabled}
                onChangeCallback={emptyFn}
                onClick={toggle}
                text={titleText}
            />
            {isOpen && content}
        </div>
    );
};

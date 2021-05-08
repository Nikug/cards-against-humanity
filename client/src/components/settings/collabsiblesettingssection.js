import React, { useState } from 'react';
import { CONTROL_TYPES, Setting } from './setting';
import { emptyFn } from '../../helpers/generalhelpers';
import Icon from '../Icon.jsx';

export const CollabsibelSettingsSection = ({ content, isDisabled, title }) => {
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
                icon={{ name: titleIconName, className: iconClassnames, isDisabled: isDisabled }}
                isDisabled={isDisabled}
                onChangeCallback={emptyFn}
                onClick={toggle}
                text={titleText}
            />
            {isOpen && content}
        </div>
    );
};

import React from 'react';
import { useTranslation } from 'react-i18next';
import { translateCommon } from '../../helpers/translation-helpers';
import Icon from '../general/Icon';

export const GameSettingsInfo = ({ keyword, plainText, link }) => {
    const { t } = useTranslation();
    let text = plainText ?? translateCommon(keyword, t);
    let content = <span className="text">{text}</span>;

    if (link) {
        content = (
            <a className="text link" target="_blank" href={link}>
                {text}
            </a>
        );
    }

    return (
        <div className="game-settings-info">
            <Icon className="icon light-blue" name="help_center" />
            {content}
        </div>
    );
};

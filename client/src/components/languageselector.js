import React from 'react';
import Tippy from '@tippyjs/react';

import { useTranslation } from 'react-i18next';
import { sortByProperty } from '../helpers/generalhelpers';
import { LOCAL_STORAGE_FIELDS, setItemToLocalStorage } from '../helpers/localstoragehelpers';
import { translateCommon } from '../helpers/translation-helpers';
import i18n from '../i18n';
import Icon from './general/Icon';
import { Button } from './general/Button';

const RadioButton = ({ id, label, checked, onSelect }) => {
    return (
        <div className={'language-selector-radio-button-row'} key={id} onClick={() => onSelect(id)}>
            <Icon name={checked ? 'check_box' : 'check_box_outline_blank'} />
            <span className="label">{label}</span>
        </div>
    );
};

export const LanguageSelector = () => {
    const { t } = useTranslation();

    const languages = sortByProperty(i18n.languages);
    const currentLanguage = i18n.language;
    const radioButtons = [];

    const onSelect = (id) => {
        const newLanguage = languages[id];
        i18n.changeLanguage(newLanguage);
        setItemToLocalStorage(LOCAL_STORAGE_FIELDS.LANGUAGE, newLanguage);
    };

    for (let i = 0, len = languages.length; i < len; i++) {
        const lang = languages[i];
        const checked = lang === currentLanguage;

        radioButtons.push(<RadioButton key={i} id={i} label={lang} checked={checked} onSelect={onSelect} />);
    }

    return (
        <Tippy
            trigger={'click'}
            duration={[100, 0]}
            placement="bottom-start"
            role="menu"
            theme="menu"
            interactive={true}
            arrow={true}
            content={
                <div className="language-selector-wrapper">
                    <div className="title">{translateCommon('chooseLanguage', t)}</div>
                    <div className="radio-buttons">{radioButtons}</div>
                </div>
            }
        >
            <span>
                <Icon className="header-icon" name="language" />
            </span>
        </Tippy>
    );
};

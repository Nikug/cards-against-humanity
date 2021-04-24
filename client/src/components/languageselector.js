import React from "react";

import { useTranslation } from "react-i18next";
import { sortByProperty } from "../helpers/generalhelpers";
import { LOCAL_STORAGE_FIELDS, setItemToLocalStorage } from "../helpers/localstoragehelpers";
import { translateCommon } from "../helpers/translation-helpers";
import i18n from "../i18n";

const RadioButton = ({id, label, checked, onSelect}) => {
    return (
        <>
            <input type="radio" id={id} name={label} value={label} checked={checked} onChange={() => onSelect(id)}/>
            <label className="radio-button-label" onClick={() => onSelect(id)}>{label}</label>
            <br></br>
        </>
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
    }

    for (let i = 0, len = languages.length; i < len; i++) {
        const lang = languages[i];
        const checked = lang === currentLanguage;

        radioButtons.push(<RadioButton key={i} id={i} label={lang} checked={checked} onSelect={onSelect}/>)
    }

    return (
        <div className="language-selector-wrapper">
            <div className="title">{translateCommon('chooseLanguage', t)}</div>
            <div className="radio-buttons">
                {radioButtons}
            </div>
        </div>
    );
};

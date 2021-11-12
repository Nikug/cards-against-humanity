import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Tippy from '@tippyjs/react';

import { useTranslation } from 'react-i18next';
import { translateCommon } from '../helpers/translation-helpers';
import Icon from './general/Icon';
import { Slider } from './general/Slider';
import { userSettingsSelector } from '../selectors/userSettingsSelector';
import { updateUserSettings } from '../actions/userSettingsActions';
import { DEFAULT_VOLUMES } from '../consts/volumes';
import { ToggleWithText } from './general/ToggleWithText';

export const UserSettings = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const userSettings = useSelector(userSettingsSelector);

    const [radioVolValue, setRadioVolValue] = useState(DEFAULT_VOLUMES.RADIO);
    const [textToSpeechVolValue, setText2SpeechVolValue] = useState(DEFAULT_VOLUMES.TEXTTOSPEECH);
    const [soundEffectVolValue, setSoundEffectVolValue] = useState(DEFAULT_VOLUMES.DEFAULT);

    useEffect(() => {
        if (userSettings.radioVolume !== undefined) {
            setRadioVolValue(userSettings.radioVolume);
        }
    }, [userSettings.radioVolume]);

    useEffect(() => {
        if (userSettings.textToSpeechVolume !== undefined) {
            setText2SpeechVolValue(userSettings.textToSpeechVolume);
        }
    }, [userSettings.textToSpeechVolume]);

    useEffect(() => {
        if (userSettings.soundEffectVolume !== undefined) {
            setSoundEffectVolValue(userSettings.soundEffectVolume);
        }
    }, [userSettings.soundEffectVolume]);

    const change = (event, changeParams) => {
        const field = changeParams?.field;

        if (!field || !event.target) {
            return;
        }

        switch (field) {
            case 'radioVolume':
                setRadioVolValue(event.target.value);
                break;
            case 'textToSpeechVolume':
                setText2SpeechVolValue(event.target.value);
                break;
            case 'soundEffectVolume':
                setSoundEffectVolValue(event.target.value);
                break;
            default:
                break;
        }
    };

    const updateVolume = (event, changeParams) => {
        if (!changeParams || !event.target) {
            return;
        }

        dispatch(updateUserSettings({ [changeParams.field]: event.target.value }));
    };

    const toggleAlwaysReadCardsForMe = (newValue) => {
        dispatch(updateUserSettings({ alwaysReadCardsForMe: newValue }));
    };

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
                <div className="user-settings-wrapper">
                    <div className="title">{translateCommon('settings', t)}</div>
                    <Slider
                        title={translateCommon('radioVolume', t)}
                        value={radioVolValue}
                        changeCallback={change}
                        changeParams={{ field: 'radioVolume' }}
                        onMouseUpCallback={updateVolume}
                    />
                    <Slider
                        title={translateCommon('textToSpeechVolume', t)}
                        value={textToSpeechVolValue}
                        changeCallback={change}
                        changeParams={{ field: 'textToSpeechVolume' }}
                        onMouseUpCallback={updateVolume}
                    />
                    <Slider
                        title={translateCommon('soundEffectVolume', t)}
                        value={soundEffectVolValue}
                        changeCallback={change}
                        changeParams={{ field: 'soundEffectVolume' }}
                        onMouseUpCallback={updateVolume}
                    />
                    <ToggleWithText
                        text={translateCommon('alwaysReadCardsForMe', t)}
                        currentValue={userSettings.alwaysReadCardsForMe}
                        onChangeCallback={toggleAlwaysReadCardsForMe}
                    />
                </div>
            }
        >
            <span className="header-button">
                <Icon className="header-icon" name="settings" />
                <span className="header-button-text">{translateCommon('settings', t)}</span>
            </span>
        </Tippy>
    );
};

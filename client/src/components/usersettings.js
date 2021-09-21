import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Tippy from '@tippyjs/react';

import { useTranslation } from 'react-i18next';
import { translateCommon } from '../helpers/translation-helpers';
import Icon from './general/Icon';
import { Slider } from './general/Slider';
import { userSettingsSelector } from '../selectors/userSettingsSelector';
import { updateUserSettings } from '../actions/userSettingsActions';
import { VOLUMES } from '../consts/volumes';

export const UserSettings = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const userSettings = useSelector(userSettingsSelector);

    const [radioVolValue, setRadioVolValue] = useState(VOLUMES.RADIO);
    const [textToSpeechVolValue, setText2SpeechVolValue] = useState(VOLUMES.TEXTTOSPEECH);
    const [soundEffectVolValue, setSoundEffectVolValue] = useState(VOLUMES.DEFAULT);

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
        if (userSettings.soundEffectVolValue !== undefined) {
            setSoundEffectVolValue(userSettings.soundEffectVolValue);
        }
    }, [userSettings.soundEffectVolValue]);

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

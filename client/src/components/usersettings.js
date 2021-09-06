import React, { useState } from 'react';
import Tippy from '@tippyjs/react';

import { useTranslation } from 'react-i18next';
import { translateCommon } from '../helpers/translation-helpers';
import Icon from './general/Icon';
import { Slider } from './general/Slider';

const DEFAULT_VOLUME = 50;

export const UserSettings = () => {
    const { t } = useTranslation();

    const [radioVolValue, setRadioVolValue] = useState(DEFAULT_VOLUME);
    const [text2SpeechVolValue, setText2SpeechVolValue] = useState(DEFAULT_VOLUME);
    const [soundEffectVolValue, setSoundEffectVolValue] = useState(DEFAULT_VOLUME);

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
                    <Slider title={translateCommon('radioVolume', t)} value={radioVolValue} changeCallback={(event) => setRadioVolValue(event.target.value)} />
                    <Slider
                        title={translateCommon('textToSpeechVolume', t)}
                        value={text2SpeechVolValue}
                        changeCallback={(event) => setText2SpeechVolValue(event.target.value)}
                    />
                    <Slider
                        title={translateCommon('soundEffectVolume', t)}
                        value={soundEffectVolValue}
                        changeCallback={(event) => setSoundEffectVolValue(event.target.value)}
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

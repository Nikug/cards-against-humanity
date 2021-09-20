import Icon from './Icon';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { userSettingsRadioVolumeSelector } from '../../selectors/userSettingsSelector';
import { useSelector } from 'react-redux';
import { radioVolumeAdjuster } from '../../helpers/audio/volumeAdjusters';

export const Music = () => {
    const audioRef = useRef(new Audio('https://stream.bauermedia.fi/radionova/radionova_64.aac'));
    const [isPlaying, setIsPlaying] = useState(false);

    const radioVolume = useSelector(userSettingsRadioVolumeSelector);

    audioRef.current.volume = radioVolumeAdjuster(radioVolume);

    useEffect(() => {
        audioRef.current.volume = radioVolumeAdjuster(radioVolume);
    }, [radioVolume]);

    const toggle = () => {
        const newState = !isPlaying;

        setIsPlaying(newState);

        if (newState) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
    };

    const icon = useMemo(() => (isPlaying ? 'pause_circle_outline' : 'play_circle_outline'), [isPlaying]);

    return <Icon onClick={toggle} name={icon} />;
};

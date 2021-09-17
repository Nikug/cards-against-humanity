import Icon from './Icon';
import React, { useRef, useState, useEffect } from 'react';
import { userSettingsRadioVolumeSelector } from '../../selectors/userSettingsSelector';
import { useSelector } from 'react-redux';

export const Music = () => {
    const audioRef = useRef(new Audio('https://stream.bauermedia.fi/radionova/radionova_64.aac'));
    const [isPlaying, setIsPlaying] = useState(false);

    const radioVolume = useSelector(userSettingsRadioVolumeSelector);

    audioRef.current.volume = radioVolume ? radioVolume / 200 : 0.05;

    useEffect(() => {
        audioRef.current.volume = radioVolume ? radioVolume / 200 : 0.05;
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

    const icon = isPlaying ? 'pause_circle_outline' : 'play_circle_outline';

    return <Icon onClick={toggle} name={icon} />;
};

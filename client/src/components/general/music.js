import Icon from './Icon';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { userSettingsRadioVolumeSelector } from '../../selectors/userSettingsSelector';
import { useSelector } from 'react-redux';
import { radioVolumeAdjuster } from '../../helpers/audio/volumeAdjusters';

const radioChannels = [
    {
        displayName: 'Pooki',
        url: 'https://stream.bauermedia.fi/radiopooki/radiopooki_64.aac',
    },
    {
        displayName: 'Nova',
        url: 'https://stream.bauermedia.fi/radionova/radionova_64.aac',
    },
    {
        displayName: 'House',
        url: 'http://streaming.tdiradio.com:8000/house.mp3',
    },
];

export const Music = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [channel, setChannel] = useState(0);

    const audioRef = useRef(new Audio(radioChannels[channel].url));
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

    const previousChannel = () => {
        audioRef.current.pause();

        let newChannel = channel - 1;

        if (newChannel === -1) {
            newChannel = radioChannels.length - 1;
        }

        setChannel(newChannel);
        audioRef.current.src = radioChannels[newChannel].url;

        audioRef.current.play();
    };

    const nextChannel = () => {
        audioRef.current.pause();

        let newChannel = channel + 1;

        if (newChannel === radioChannels.length) {
            newChannel = 0;
        }

        setChannel(newChannel);
        audioRef.current.src = radioChannels[newChannel].url;

        audioRef.current.play();
    };

    const icon = useMemo(() => (isPlaying ? 'pause_circle_outline' : 'play_circle_outline'), [isPlaying]);

    return (
        <div className="radio">
            <div className="radio-channel-changers-wrapper">
                <Icon onClick={previousChannel} name={'skip_previous'} />
                <span className="channel-name">{radioChannels[channel].displayName}</span>
                <Icon onClick={nextChannel} name={'skip_next'} />
            </div>
            <Icon onClick={toggle} name={icon} />
        </div>
    );
};

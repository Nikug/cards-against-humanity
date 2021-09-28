import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Icon from '../../general/Icon';
import { AvatarImage } from './AvatarImage';
import { maxAvatarTypes } from '../../../assets/avatarimages/avatarIcons';
import { socket } from '../../sockets/socket';
import { playerIdSelector } from '../../../selectors/playerSelectors';
import { gameIdSelector } from '../../../selectors/gameSelectors';
import { SettingContainer } from '../../settings/SettingContainer';

const defaultAvatar = {
    hatType: 0,
    eyeType: 0,
    mouthType: 0,
    skinType: 0,
};

const defaultButtonStates = {
    hatTypenext: false,
    hatTypeprev: true,
    eyeTypenext: false,
    eyeTypeprev: true,
    mouthTypenext: false,
    mouthTypeprev: true,
};

export const AvatarCreator = () => {
    const playerID = useSelector(playerIdSelector);
    const gameID = useSelector(gameIdSelector);

    const [currentAvatar, setCurrentAvatar] = useState(defaultAvatar);
    const [showAsDisabled, setShowAsDisabled] = useState(defaultButtonStates);

    const updateButtons = (type, dir, newAvatar) => {
        const nextButton = type + 'next';
        const prevButton = type + 'prev';

        if (dir === 'next' && newAvatar >= maxAvatarTypes[type]) {
            // Disable next button
            console.debug('Set nextButton1');
            setShowAsDisabled((prevState) => ({ ...prevState, [nextButton]: true }));
        } else if (dir === 'prev' && showAsDisabled[nextButton] === true) {
            // Activate next button
            console.debug('Set nextButton2');
            setShowAsDisabled((prevState) => ({ ...prevState, [nextButton]: false }));
        }
        if (dir === 'prev' && newAvatar <= 0) {
            // Disable prev button
            console.debug('Set prevButton1');
            setShowAsDisabled((prevState) => ({ ...prevState, [prevButton]: true }));
        } else if (dir === 'next' && showAsDisabled[prevButton] === true) {
            // Activate prev button
            console.debug('Set prevButton2');
            setShowAsDisabled((prevState) => ({ ...prevState, [prevButton]: false }));
        }
    };

    const changeAvatar = (type, dir) => {
        if (dir === 'next') {
            // If there is a picture for the next type
            if (currentAvatar[type] + 1 <= maxAvatarTypes[type]) {
                const newValue = currentAvatar[type] + 1;
                const newAvatar = { ...currentAvatar, [type]: newValue };

                setCurrentAvatar(newAvatar);
                updateButtons(type, dir, newValue);
            }
        } else if (dir === 'prev') {
            if (currentAvatar[type] - 1 >= 0) {
                const newValue = currentAvatar[type] - 1;
                const newAvatar = { ...currentAvatar, [type]: newValue };

                setCurrentAvatar(newAvatar);
                updateButtons(type, dir, newValue);
            }
        } else {
            return;
        }
    };

    useEffect(() => {
        const setPlayerAvatar = (avatar) => {
            if (playerID) {
                socket.emit('set_player_avatar', {
                    gameID: gameID,
                    playerID: playerID,
                    avatar: avatar,
                });
            }
        };

        setPlayerAvatar(currentAvatar);
    }, [currentAvatar, gameID, playerID]);

    return (
        <SettingContainer className="avatar-creator-container">
            <div className="arrow-left-1">
                <Icon
                    name="arrow_back_ios"
                    className="button-icon no-margin-right"
                    color={showAsDisabled.hatTypeprev ? 'disabled' : 'active'}
                    onClick={() => changeAvatar('hatType', 'prev')}
                />
            </div>
            <div className="arrow-left-2">
                <Icon
                    name="arrow_back_ios"
                    className="button-icon no-margin-right"
                    color={showAsDisabled.eyeTypeprev ? 'disabled' : 'active'}
                    onClick={() => changeAvatar('eyeType', 'prev')}
                />
            </div>
            <div className="arrow-left-3">
                <Icon
                    name="arrow_back_ios"
                    className="button-icon no-margin-right"
                    color={showAsDisabled.mouthTypeprev ? 'disabled' : 'active'}
                    onClick={() => changeAvatar('mouthType', 'prev')}
                />
            </div>
            <div className="avatar">
                <AvatarImage displaySize="large" avatar={currentAvatar} />
            </div>
            <div className="arrow-right-1">
                <Icon
                    name="arrow_forward_ios"
                    className="button-icon no-margin-right"
                    color={showAsDisabled.hatTypenext ? 'disabled' : 'active'}
                    onClick={() => changeAvatar('hatType', 'next')}
                />
            </div>
            <div className="arrow-right-2">
                <Icon
                    name="arrow_forward_ios"
                    className="button-icon no-margin-right"
                    color={showAsDisabled.eyeTypenext ? 'disabled' : 'active'}
                    onClick={() => changeAvatar('eyeType', 'next')}
                />
            </div>
            <div className="arrow-right-3">
                <Icon
                    name="arrow_forward_ios"
                    className="button-icon no-margin-right"
                    color={showAsDisabled.mouthTypenext ? 'disabled' : 'active'}
                    onClick={() => changeAvatar('mouthType', 'next')}
                />
            </div>
        </SettingContainer>
    );
};

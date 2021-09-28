import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Icon from '../general/Icon';
import { AvatarImage } from './AvatarImage';
import { maxAvatarTypes } from '../../assets/avatarimages/avatarIcons';
import { socket } from '../../components/sockets/socket';
import { playerSelector } from '../../selectors/playerSelectors';
import { gameSelector } from '../../selectors/gameSelectors';

const defaultAvatar = {
    hatType: 0,
    eyeType: 0,
    mouthType: 0,
    skinType: 0,
};

const defaultButtonStates = {
    hatTypenext: false,
    hatTypeprev: false,
    eyeTypenext: false,
    eyeTypeprev: false,
    mouthTypenext: false,
    mouthTypeprev: false,
};

export const AvatarCreator = () => {
    const [currentAvatar, setCurrentAvatar] = useState(defaultAvatar);
    const [showAsDisabled, setShowAsDisabled] = useState(defaultButtonStates);
    const updateButtons = (type, dir, newAvatar) => {
        const nextButton = type + 'next';
        const prevButton = type + 'prev';

        /* HOX
            If-statements work
                (tested with: 
                    useEffect(() => {
                        console.debug(showAsDisabled);
                    }, [showAsDisabled]);
                )
            BUTTON COLORS DON'T SHOW 'active' and 'disabled'
        */

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
                const newAvatar = currentAvatar[type] + 1;
                setCurrentAvatar((prevAvatar) => ({ ...prevAvatar, [type]: newAvatar }));
                updateButtons(type, dir, newAvatar);
            }
        } else if (dir === 'prev') {
            if (currentAvatar[type] - 1 >= 0) {
                const newAvatar = currentAvatar[type] - 1;
                setCurrentAvatar((prevAvatar) => ({ ...prevAvatar, [type]: newAvatar }));
                updateButtons(type, dir, newAvatar);
            }
        } else {
            return;
        }
    };

    const player = useSelector(playerSelector);
    const game = useSelector(gameSelector);
    useEffect(() => {
        const setPlayerAvatar = (avatar) => {
            if (!!player?.id) {
                socket.emit('set_player_avatar', {
                    gameID: game?.id,
                    playerID: player?.id,
                    avatar: avatar,
                });
            }
        };
        setPlayerAvatar(currentAvatar);
    }, [currentAvatar]);

    return (
        <div className="avatar-creator-container">
            <div className="arrow-left-1">
                <Icon
                    name="arrow_back_ios"
                    className="button-icon no-margin-right"
                    color={showAsDisabled.hatprev ? 'disabled' : 'active'}
                    onClick={() => changeAvatar('hatType', 'prev')}
                />
            </div>
            <div className="arrow-left-2">
                <Icon
                    name="arrow_back_ios"
                    className="button-icon no-margin-right"
                    color={showAsDisabled.eyeprev ? 'disabled' : 'active'}
                    onClick={() => changeAvatar('eyeType', 'prev')}
                />
            </div>
            <div className="arrow-left-3">
                <Icon
                    name="arrow_back_ios"
                    className="button-icon no-margin-right"
                    color={showAsDisabled.mouthprev ? 'disabled' : 'active'}
                    onClick={() => changeAvatar('mouthType', 'prev')}
                />
            </div>
            <div className="avatar">
                <AvatarImage displayType="large" avatar={currentAvatar} />
            </div>
            <div className="arrow-right-1">
                <Icon
                    name="arrow_forward_ios"
                    className="button-icon no-margin-right"
                    color={showAsDisabled.hatnext ? 'disabled' : 'active'}
                    onClick={() => changeAvatar('hatType', 'next')}
                />
            </div>
            <div className="arrow-right-2">
                <Icon
                    name="arrow_forward_ios"
                    className="button-icon no-margin-right"
                    color={showAsDisabled.eyenext ? 'disabled' : 'active'}
                    onClick={() => changeAvatar('eyeType', 'next')}
                />
            </div>
            <div className="arrow-right-3">
                <Icon
                    name="arrow_forward_ios"
                    className="button-icon no-margin-right"
                    color={showAsDisabled.mouthnext ? 'disabled' : 'active'}
                    onClick={() => changeAvatar('mouthType', 'next')}
                />
            </div>
        </div>
    );
};

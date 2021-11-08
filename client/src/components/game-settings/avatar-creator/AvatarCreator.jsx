import React from 'react';
import { useSelector } from 'react-redux';
import { AvatarImage } from './AvatarImage';
import { maxAvatarTypes } from '../../../assets/avatarimages/avatarIcons';
import { socket } from '../../sockets/socket';
import { playerAvatarSelector, playerIdSelector } from '../../../selectors/playerSelectors';
import { gameIdSelector } from '../../../selectors/gameSelectors';
import { SettingContainer } from '../../settings/SettingContainer';
import { AvatarCreatorArrow } from './AvatarCreatorArrow';

export const AVATAR_ARROW_DIRECTION = {
    PREVIOUS: 'previous',
    NEXT: 'next',
};

const TYPE = {
    HAT: 'hatType',
    EYES: 'eyeType',
    MOUTH: 'mouthType',
};

export const AvatarCreator = () => {
    const playerID = useSelector(playerIdSelector);
    const gameID = useSelector(gameIdSelector);
    const avatar = useSelector(playerAvatarSelector);

    const changeAvatar = (type, direction) => {
        const avatarOptionsLength = maxAvatarTypes[type];
        const delta = direction === AVATAR_ARROW_DIRECTION.NEXT ? 1 : direction === AVATAR_ARROW_DIRECTION.PREVIOUS ? -1 : 0;
        let newValue = avatar[type] + delta;

        if (newValue > avatarOptionsLength) {
            newValue = 0;
        }

        if (newValue < 0) {
            newValue = avatarOptionsLength;
        }

        const newAvatar = { ...avatar, [type]: newValue };

        changePlayerAvatar(newAvatar);
    };

    const changePlayerAvatar = (avatar) => {
        if (playerID) {
            socket.emit('set_player_avatar', {
                gameID,
                playerID,
                avatar,
            });
        }
    };

    return (
        <SettingContainer className="avatar-creator-container">
            <AvatarCreatorArrow className="arrow-left-1" callback={changeAvatar} type={TYPE.HAT} direction={AVATAR_ARROW_DIRECTION.PREVIOUS} />
            <AvatarCreatorArrow className="arrow-left-2" callback={changeAvatar} type={TYPE.EYES} direction={AVATAR_ARROW_DIRECTION.PREVIOUS} />
            <AvatarCreatorArrow className="arrow-left-3" callback={changeAvatar} type={TYPE.MOUTH} direction={AVATAR_ARROW_DIRECTION.PREVIOUS} />
            <div className="avatar">
                <AvatarImage displaySize="large" avatar={avatar} />
            </div>
            <AvatarCreatorArrow className="arrow-right-1" callback={changeAvatar} type={TYPE.HAT} direction={AVATAR_ARROW_DIRECTION.NEXT} />
            <AvatarCreatorArrow className="arrow-right-2" callback={changeAvatar} type={TYPE.EYES} direction={AVATAR_ARROW_DIRECTION.NEXT} />
            <AvatarCreatorArrow className="arrow-right-3" callback={changeAvatar} type={TYPE.MOUTH} direction={AVATAR_ARROW_DIRECTION.NEXT} />
        </SettingContainer>
    );
};

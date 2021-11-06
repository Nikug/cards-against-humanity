import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { socket } from '../sockets/socket';

import { useTransition } from 'react-spring';
import { animated } from 'react-spring';
import { useTranslation } from 'react-i18next';
import Tippy from '@tippyjs/react';

import { ActionButtonRow, BUTTON_ROW_DIRECTION } from '../../layouts/Game/components/GameMenu/ActionButtonRow';
import Icon from '../general/Icon';
import { translateCommon } from '../../helpers/translation-helpers';
import { BUTTON_TYPES } from '../general/Button';
import { playerIdSelector, playerIsHostSelector } from '../../selectors/playerSelectors';
import { gameIdSelector } from '../../selectors/gameSelectors';
import { AvatarImage } from '../game-settings/avatar-creator/AvatarImage';
import { classNames } from '../../helpers/classnames';

export const Player = ({ avatar, name, state, score, isCardCzar, isHost, isPopularVoteKing, isSelf, publicID }) => {
    const { t } = useTranslation();

    // State
    const isSelfHost = useSelector(playerIsHostSelector);
    const selfID = useSelector(playerIdSelector);
    const gameID = useSelector(gameIdSelector);
    const [showTitle, setShowTitle] = useState(false);

    const noName = name === null || name === undefined;

    const nameRef = useCallback(
        (node) => {
            if (node !== null) {
                const playerNameElement = node;

                if (playerNameElement) {
                    const { clientWidth, scrollWidth } = playerNameElement;
                    if (!showTitle && playerNameElement && clientWidth < scrollWidth) {
                        setShowTitle(true);
                    } else if (showTitle && !(clientWidth < scrollWidth)) {
                        setShowTitle(false);
                    }
                }
            }
            return node;
        },
        [showTitle]
    );

    // Score animation
    const scoreTransitions = useTransition(score, null, {
        initial: {
            transform: 'translate3d(0,0px,0)',
            opacity: 1,
            height: 'auto',
            width: 'auto',
        },
        from: {
            position: 'relative',
            transform: 'translate3d(0,-20px,0)',
            opacity: 0,
            height: 0,
            width: 0,
        },
        enter: {
            transform: 'translate3d(0,0px,0)',
            opacity: 1,
            height: 'auto',
            width: 'auto',
        },
        leave: {
            opacity: 0,
            height: 0,
            width: 0,
        },
    });

    const removePlayer = (removeFromGame = true) => {
        socket.emit('kick_player', {
            gameID,
            playerID: selfID,
            targetID: publicID,
            removeFromGame: removeFromGame,
        });
    };

    const makePlayerSpectator = () => {
        removePlayer(false);
    };

    const playerStatus = (state) => {
        switch (state) {
            case 'disconnected':
                return <Icon name={'error_outline'} className={`player-status clock status-${state}`} />;
            case 'kicked':
                return <Icon name={'error_outline'} className={`player-status clock status-${state}`} />;
            case 'active':
                return <Icon name={'error_outline'} className={`player-status clock status-${state}`} />;
            case 'playing':
                return <Icon name={'error_outline'} className={`player-status clock status-${state}`} />;
            case 'waiting':
                return <Icon name={'watch_later'} className={`player-status clock status-${state}`} />;
            case 'joining':
                return <Icon name={'watch_later'} className={`player-status clock status-${state}`} />;
            case 'pickingName':
                /* Switched the spinner from player-name span to status 
                    Not working currently :c */
                /*
                return (
                    <span ref={nameRef} className={`player-status clock status-${state}`}>
                        <i className="fa fa-spinner fa-spin" style={{ fontSize: '24px' }} />
                    </span>
                ); */
                return <Icon name={'watch_later'} className={`player-status clock status-${state}`} />;
            case 'spectating':
                return <Icon name={'error_outline'} className={`player-status clock status-${state}`} />;
            default:
                return <Icon name={'watch_later'} className={`player-status clock status-${state}`} />;
        }
    };

    const playerElement = (
        <div title={showTitle ? name : undefined} className={`player ${isCardCzar ? 'cardCzar' : ''}`}>
            {/* AVATAR ICON */}
            <AvatarImage displaySize="small" avatar={avatar} isCardCzar={isCardCzar} />

            {/* PLAYER STATUS */}
            {playerStatus(state)}

            {/* PLAYER NAME (Name icon could now be switched for status icon*/}

            <span className={classNames('player-name', { host: isHost === true, myself: isSelf === true })}>{name}</span>

            {/* PLAYER SCORE ICON */}
            <Icon name="emoji_events" className="win-icon" />

            {/* PLAYER SCORE*/}
            <span className="player-score">
                {scoreTransitions.map(({ item, props, key }) => (
                    <animated.div className="score" key={key} style={props}>
                        {item}
                    </animated.div>
                ))}
            </span>

            {/* HOST ICON */}
            {isHost && <Icon name={'home'} className={`host-icon white`} />}

            {/* POPULAR VOTE ICON */}
            {isPopularVoteKing && (
                <span className="player-popularVoteScore">
                    <Icon name="thumb_up_alt" className="popular-vote-icon" />
                </span>
            )}
        </div>
    );

    return isSelfHost && !isSelf ? (
        <Tippy
            trigger={'click'}
            duration={[100, 0]}
            placement="bottom-start"
            role="menu"
            theme="menu"
            interactive={true}
            arrow={true}
            content={
                <>
                    <span className="title">{name}</span>
                    <ActionButtonRow
                        direction={BUTTON_ROW_DIRECTION.COLUMN}
                        buttons={[
                            {
                                type: BUTTON_TYPES.PRIMARY,
                                icon: 'logout',
                                text: translateCommon('removeFromGame', t),
                                callback: removePlayer,
                            },
                            {
                                type: BUTTON_TYPES.PRIMARY,
                                icon: 'groups',
                                text: translateCommon('moveToAudience', t),
                                callback: makePlayerSpectator,
                            },
                        ]}
                    />
                </>
            }
        >
            {playerElement}
        </Tippy>
    ) : (
        playerElement
    );
};

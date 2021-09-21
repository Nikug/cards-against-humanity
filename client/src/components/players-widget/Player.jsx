import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { socket } from '../sockets/socket';

import { useTransition } from 'react-spring';
import { animated } from 'react-spring';
import { useTranslation } from 'react-i18next';
import Tippy from '@tippyjs/react';

import { ActionButtonRow, BUTTON_ROW_DIRECTION } from '../../layouts/Game/components/GameMenu/ActionButtonRow';
import Icon from '../general/Icon';
import crownIcon from './../../assets/svgicons/crown-svgrepo-com.svg';
import { translateCommon } from '../../helpers/translation-helpers';
import { BUTTON_TYPES } from '../general/Button';
import { playerIdSelector, playerIsHostSelector } from '../../selectors/playerSelectors';
import { gameIdSelector } from '../../selectors/gameSelectors';
import { AvatarImage } from '../game-settings/AvatarImage';

export const Player = ({ name, state, score, isCardCzar, isHost, isPopularVoteKing, isSelf, publicID }) => {
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

    const playerElement = (
        <div className="player-container">

            <div className="player-avatar">
                <AvatarImage
                    displayType="playerWidget" 
                    hatNumber={1}
                    eyeNumber={1}
                    mouthNumber={1}
                />
            </div>
            <div title={showTitle ? name : undefined} className={`player ${isCardCzar ? 'cardCzar' : ''}`}>
                {isCardCzar && (
                    <div className="icon-anchor">
                        <img className="crown-icon" src={crownIcon} alt="crown" />
                    </div>
                )}
                <span className={`player-name-and-status  ${isHost && false ? 'host' : ''}  ${isSelf ? 'myself' : ''}`}>
                    {state === 'playing' && (
                        <Icon
                            name={'watch_later'}
                            className={`player-status clock status-${state}
                `}
                        />
                    )}
                    {(state === 'disconnected' || state === 'kicked') && (
                        <Icon
                            name={'error_outline'}
                            className={`player-status clock status-${state}
                `}
                        />
                    )}
                    {isHost && <Icon name={'home'} className={`player-status white`} />}
                    <span ref={nameRef} className={`player-name ${noName ? 'no-name' : ''}`}>
                        {name}
                        {noName && <i className="fa fa-spinner fa-spin" style={{ fontSize: '24px' }} />}
                    </span>
                </span>
                <span className="🦄">
                    <span className="player-score">
                        <Icon name="emoji_events" className="win-icon" />
                        {scoreTransitions.map(({ item, props, key }) => (
                            <animated.div className="score" key={key} style={props}>
                                {item}
                            </animated.div>
                        ))}
                    </span>
                    {isPopularVoteKing && (
                        <span className="player-popularVoteScore">
                            <Icon name="thumb_up_alt" className="popular-vote-icon" />
                        </span>
                    )}
                </span>
            </div>
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

import { Link, useHistory, useLocation } from 'react-router-dom';
import React, { useCallback, useEffect, useState } from 'react';

import Icon from './general/Icon';
import { deleteCookie } from '../helpers/cookies';
import logo from './../assets/images/korttipeli_favicon.png';
import { socket } from './sockets/socket';
import thinkingIcon from './../assets/svgicons/thinking.svg';
import { translateCommon } from '../helpers/translation-helpers';
import { useTranslation } from 'react-i18next';
import { PopOverMenu } from './popover-menu/PopoverMenu';
import { LanguageSelector } from './languageselector';
import { useDispatch, useSelector } from 'react-redux';
import { playerActionTypes } from '../actions/playerActions';

export const Header = (props) => {
    const { t } = useTranslation();
    const text = translateCommon('cardsAgainstHumankind', t);
    const { game, player } = props;

    const [showTitle, setShowTitle] = useState(false);

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
        [text]
    );

    const pathName = useLocation().pathname;

    const leaveGame = () => {
        deleteCookie('playerID');
        socket.emit('leave_game', {
            gameID: game?.id,
            playerID: player?.id,
        });
        // props.reset();
        // history.push("/");

        // dispatch({
        //     type: playerActionTypes.UPDATE,
        //     payload: { name: 'Nipa' },
        // });
    };

    const p = useSelector((state) => state.player);

    useEffect(() => {
        console.log('player is', p);
    }, [p]);

    return (
        <div className="header">
            <Link to="/" className="header-link" title={showTitle ? text : undefined}>
                <div className="header-logo-and-name">
                    <img className="logo" src={logo} />
                    <span ref={nameRef} className="name">
                        {text.toUpperCase()}
                    </span>
                </div>
            </Link>
            <div className="buttons">
                {true && (
                    <span className="header-button language">
                        <LanguageSelector />
                    </span>
                )}

                {false && (
                    <Link to="/support-us">
                        <span className="header-button">
                            <img className="thinking-icon" src={thinkingIcon} />
                        </span>
                    </Link>
                )}
                <Link to="/instructions">
                    <span className="header-button">
                        <Icon className="header-icon" name="help_center" />
                        <span className="header-button-text">{translateCommon('instructions', t)}</span>
                    </span>
                </Link>
                <span className="header-button" onClick={() => alert('Tästä aukeaa vielä joskus ehkä asetusvalikko')}>
                    <Icon className="header-icon" name="settings" />
                    <span className="header-button-text">{translateCommon('settings', t)}</span>
                </span>
                {game && pathName === `/g/${game.id}` && (
                    <Link to="/">
                        <span href="/" className="header-button" onClick={leaveGame}>
                            <Icon className="header-icon" name="logout" />
                            <span className="header-button-text">{translateCommon('leave', t)}</span>
                        </span>
                    </Link>
                )}
            </div>
        </div>
    );
};

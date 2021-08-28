import { Link, useLocation } from 'react-router-dom';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { socket } from './sockets/socket';

import Icon from './general/Icon';
import { deleteCookie } from '../helpers/cookies';
import logo from './../assets/images/korttipeli_favicon.png';
import thinkingIcon from './../assets/svgicons/thinking.svg';
import { translateCommon } from '../helpers/translation-helpers';
import { LanguageSelector } from './languageselector';

export const Header = () => {
    const { t } = useTranslation();
    const text = translateCommon('cardsAgainstHumankind', t);
    const gameID = useSelector((state) => state.game.value?.id);
    const playerID = useSelector((state) => state.player.value?.id);

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
            gameID,
            playerID,
        });
        // props.reset();
        // history.push("/");
    };

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
                {gameID && pathName === `/g/${gameID}` && (
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

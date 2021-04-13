import { Link, useHistory, useLocation } from "react-router-dom";
import React, { Component, useState } from "react";

import Icon from "./icon";
import { deleteCookie } from "../helpers/cookies";
import logo from "./../assets/images/korttipeli_favicon.png";
import { socket } from "./sockets/socket";
import thinkingIcon from "./../assets/svgicons/thinking.svg";
import { translateCommon } from "../helpers/translation-helpers";
import { useTranslation } from "react-i18next";
import { isPlayerHost } from "../helpers/player-helpers";
import { PopOverMenu } from "./popover-menu/PopoverMenu";
import { Button } from "./button";
import { LanguageSelector } from "./languageselector";

export const Header = (props) => {
    const { t } = useTranslation();
    const text = translateCommon("cardsAgainstHumankind", t);
    const { game, player } = props;

    const [menuIsOpen, setMenuIsOpen] = useState(false);

    const toggleMenu = () => {
        setMenuIsOpen(!menuIsOpen);
    };

    const history = useHistory();
    const pathName = useLocation().pathname;

    const leaveGame = () => {
        deleteCookie("playerID");
        socket.emit("leave_game", {
            gameID: game?.id,
            playerID: player?.id,
        });
        // props.reset();
        // history.push("/");
    };

    return (
        <div className="header">
            <Link to="/">
                <div className="header-text">
                    <img className="logo" src={logo} />
                    {text.toUpperCase()}
                </div>
            </Link>
            <div className="buttons">
                <span className="header-button language">
                    <Icon
                        className="header-icon"
                        name="language"
                        onClick={toggleMenu}
                    />
                    <PopOverMenu
                        isDefaultOpen={menuIsOpen}
                        noControl={true}
                        content={<LanguageSelector/>}
                    />
                </span>

                <Link to="/support-us">
                    <span className="header-button">
                        <img className="thinking-icon" src={thinkingIcon} />
                    </span>
                </Link>
                <Link to="/instructions">
                    <span className="header-button">
                        <Icon className="header-icon" name="help_center" />
                        <span className="header-button-text">
                            {translateCommon("instructions", t)}
                        </span>
                    </span>
                </Link>
                <span
                    className="header-button"
                    onClick={() =>
                        alert("Tästä aukeaa vielä joskus ehkä asetusvalikko")
                    }
                >
                    <Icon className="header-icon" name="settings" />
                    <span className="header-button-text">
                        {translateCommon("settings", t)}
                    </span>
                </span>
                {pathName !== "/" && (
                    <Link to="/">
                        <span
                            href="/"
                            className="header-button"
                            onClick={leaveGame}
                        >
                            <Icon className="header-icon" name="logout" />
                            <span className="header-button-text">
                                {translateCommon("leave", t)}
                            </span>
                        </span>
                    </Link>
                )}
            </div>
        </div>
    );
};

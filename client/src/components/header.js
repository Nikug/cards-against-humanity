import React, { Component } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { isNullOrUndefined } from "../helpers/generalhelpers";
import { socket } from "./sockets/socket";
import { deleteCookie } from "../helpers/cookies";
import "./../styles/header.scss";

import Icon from "./icon";

export const Header = (props) => {
    const text = "Kortit ihmiskuntaa vastaan";
    const { game, player } = props;

    const history = useHistory();
    const pathName = useLocation().pathname;

    const leaveGame = () => {
        deleteCookie("playerID");
        socket.emit("leave_game", {
            gameID: game?.id,
            playerID: player?.id,
        });
        socket.close();
        props.reset();
        history.push("/");
    };

    return (
        <div className="header">
            <Link to="/">
                <div className="header-text">{text.toUpperCase()}</div>
            </Link>
            <div className="buttons">
                <Link to="/instructions">
                    <span className="header-button">
                        <Icon className="header-icon" name="help_center" />
                        <span className="header-button-text">Ohjeet</span>
                    </span>
                </Link>
                <span
                    className="header-button"
                    onClick={() =>
                        alert("Tästä aukeaa vielä joskus ehkä asetusvalikko")
                    }
                >
                    <Icon className="header-icon" name="settings" />
                    <span className="header-button-text">Asetukset</span>
                </span>
                {pathName !== "/" && (
                    <Link to="/">
                        <span
                            href="/"
                            className="header-button"
                            onClick={leaveGame}
                        >
                            <Icon className="header-icon" name="logout" />
                            <span className="header-button-text">Poistu</span>
                        </span>
                    </Link>
                )}
            </div>
        </div>
    );
};

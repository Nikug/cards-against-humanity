import React, { Component } from "react";
import { Link, useHistory } from "react-router-dom";
import { isNullOrUndefined } from "../helpers/generalhelpers";
import { socket } from "./sockets/socket";
import "./../styles/header.scss";

import Icon from "./icon";

export const Header = (props) => {
    const text = "Kortit ihmiskuntaa vastaan";
    const { game, player } = props;

    const history = useHistory();

    const leaveGame = () => {
        socket.emit("leave_game", {
            gameID: game.id,
            playerID: player.id,
        });
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
                {!isNullOrUndefined(game) && (
                    <Link to="/">
                        <span
                            href="/"
                            className="header-button"
                            onClick={leaveGame}
                        >
                            <Icon className="header-icon" name="exit_to_app" />
                            <span className="header-button-text">Poistu</span>
                        </span>
                    </Link>
                )}
            </div>
        </div>
    );
};

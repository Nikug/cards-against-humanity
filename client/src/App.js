import React, { useEffect, useState } from "react";
import { socket } from "./components/sockets/socket";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    useHistory,
} from "react-router-dom";
import axios from "axios";

import { Home } from "./layouts/Home";
import { Game } from "./layouts/Game";
import { Header } from "./components/header";
import Music from "./components/music";

import "./styles/App.scss";
import "./styles/footer.scss";
import "./styles/notification.scss";
import { deleteCookie, getCookie, setCookie } from "./helpers/cookies";
import {
    isNullOrUndefined,
    containsObjectWithMatchingFieldIndex,
} from "./helpers/generalhelpers";
import { Notification } from "./components/notification/notification";

export default function App(props) {
    const [isInHome, setIsInHome] = useState(true);
    const [url, setUrl] = useState("");
    const [game, setGame] = useState(undefined);
    const [player, setPlayer] = useState(undefined);
    const [notification, setNotification] = useState([]);

    const history = useHistory();

    function toggleIsInHome(isInHome) {
        setIsInHome(isInHome);
        if (isInHome) {
            resetUrl();
        }
    }

    function resetUrl() {
        setUrl("");
    }

    function startNewGame() {
        axios.post("/g").then((res) => {
            setUrl(res.data.url);
            toggleIsInHome(false);
        });
    }

    function joinExistingGame(gameUrl) {
        setUrl(gameUrl);
    }

    const fireNotification = (newNotification, timeInSeconds = 3) => {
        console.log("fire notification", newNotification);
        const newList = notification.slice();
        newList.push(newNotification);
        setNotification(newList);

        setTimeout(() => {
            hideNotification();
        }, timeInSeconds * 1000);
    };

    // TODO: Deal with deleting the correct notification, not all.
    const hideNotification = () => {
        setNotification([]);
    };

    useEffect(() => {
        setUrl(
            window.location.pathname.slice(
                0,
                window.location.pathname.length - 1
            )
        );

        socket.on("initial_data", (data) => {
            console.log("got initial data", data);
            setGame(data.game);
            setPlayer(data.player);
        });

        const cookie = getCookie("playerID");

        if (!isNullOrUndefined(cookie)) {
            console.log("cookie is", cookie);
            socket.emit("get_initial_data", {
                playerID: cookie.playerID,
            });
            //deleteCookie("playerID");
        } else {
            console.log("there was no cookie");
            //setCookie({ field: "playerID", value: "random-id-123" });
        }
    }, []);

    const notificationsToRender = [];

    for (let i = 0, len = notification.length; i < len; i++) {
        const singleNotification = notification[i];

        notificationsToRender.push(
            <Notification
                key={i}
                text={singleNotification.text}
                type={singleNotification.type}
                icon={singleNotification.icon}
            />
        );
    }

    return (
        <>
            {!isNullOrUndefined(notification) && notification.length > 0 && (
                <div className="notification-wrapper">
                    {notificationsToRender}
                </div>
            )}
            <div
                className={`App ${
                    url === "" ? "background-img" : "mono-background"
                }`}
            >
                <Router>
                    <div className="basic-grid">
                        <Header
                            isInGame={!isInHome}
                            toggleIsInGame={toggleIsInHome}
                        />
                        <Switch>
                            <Route
                                exact
                                path="/"
                                render={(props) => (
                                    <Home
                                        isInGame={!isInHome}
                                        url={url}
                                        startNewGame={startNewGame}
                                        joinExistingGame={joinExistingGame}
                                    />
                                )}
                            />
                            <Route
                                exact
                                path="/instructions"
                                render={(props) => (
                                    <div>Instructions under construction!</div>
                                )}
                            />
                            <Route
                                exact
                                path="/g/:id"
                                render={(props) => (
                                    <Game
                                        isInGame={!isInHome}
                                        resetUrl={resetUrl}
                                        game={game}
                                        player={player}
                                        fireNotification={fireNotification}
                                    />
                                )}
                            />
                        </Switch>
                    </div>
                    <div className="footer">
                        <span className="music-player">
                            <Music />
                        </span>
                        <span className="copyrights">
                            &copy; {new Date().getFullYear()}
                        </span>
                    </div>
                </Router>
            </div>
        </>
    );
}

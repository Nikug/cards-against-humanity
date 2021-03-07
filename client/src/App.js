import React, { useEffect, useState } from "react";
import { Route, Switch, useHistory, useLocation } from "react-router-dom";
import {
    containsObjectWithMatchingFieldIndex,
    isNullOrUndefined,
} from "./helpers/generalhelpers";
import { deleteCookie, getCookie, setCookie } from "./helpers/cookies";

import { Button } from "./components/button";
import { Game } from "./layouts/Game/Game.jsx";
import { Header } from "./components/header";
import { Home } from "./layouts/Home";
import { Instructions } from "./layouts/Instructions";
import Music from "./components/music";
import { Notification } from "./components/notification/notification";
import axios from "axios";
import { socket } from "./components/sockets/socket";
import { getRandomSpinner } from "./components/spinner";
import { GameContextProvider } from "./contexts/GameContext";
import { NotificationContextProvider } from "./contexts/NotificationContext";
import { socketOn } from "./helpers/communicationhelpers";

export const App = () => {
    /*****************************************************************/ // Purely for hiding dev things from the production.
    const [clicked, setClicked] = useState(0);
    const [showDebug, setShowDebug] = useState(false);

    const secretClick = () => {
        if (clicked > 3) {
            setShowDebug(true);
        } else {
            setClicked(clicked + 1);
        }
    };
    /*****************************************************************/

    const [game, setGame] = useState(undefined);
    const [player, setPlayer] = useState(undefined);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notificationCount, setNotificationCount] = useState(0);

    const history = useHistory();

    function startNewGame() {
        axios.post("/g").then((res) => {
            history.push(`/g/${res.data.url}`);
        });
    }

    function joinExistingGame(gameUrl) {
        history.push(`/g/${gameUrl}`);
    }

    const navigate = (route) => {
        history.push(`${route}`);
    };

    const getNewId = () => {
        const newId = notificationCount + 1;
        setNotificationCount((prevValue) => prevValue + 1);

        return newId;
    };

    const fireNotification = (newNotification, timeInSeconds = 4) => {
        const id = getNewId();
        console.log({ id });

        setNotifications((prevValue) => [
            ...prevValue,
            { ...newNotification, id },
        ]);

        setTimeout(() => {
            hideNotification(id);
        }, timeInSeconds * 1000);
    };

    const notificationParams = {
        fireNotification,
        notificationCount,
        setNotificationCount,
    };

    const hideNotification = (id) => {
        const newList = notifications.slice();
        console.log({ notifications, id });

        for (let i = 0, len = notifications.length; i < len; i++) {
            const notification = notifications[i];
            if (notification.id === id) {
                newList.splice(i, 1);
                break;
            }
        }

        setNotifications(newList);
    };

    useEffect(() => {
        socketOn(
            "update_game_and_players",
            (data) => {
                console.log("update_game_and_players", { data });
                if (data.error) {
                    console.log("Received error from server:", data.error);
                    setLoading(false);
                    return;
                }
                if (isNullOrUndefined(data.game)) {
                    deleteCookie("playerID");
                } else {
                    setGame((prevGame) => ({
                        ...prevGame,
                        ...data.game,
                        players: data.players,
                    }));
                    setPlayer((prevPlayer) => ({
                        ...prevPlayer,
                        ...data.player,
                    }));
                    setCookie({ field: "playerID", value: data.player.id });
                    history.push(`/g/${data.game.id}`);
                }
                setLoading(false);
            },
            notificationParams
        );

        socketOn(
            "disconnect",
            () => {
                socket.close();
                resetData();
                history.push("/");
            },
            notificationParams
        );

        return () => {
            socket.off("update_game_and_players");
            socket.off("disconnect");
        };
    }, [notificationParams, fireNotification, notificationCount]);

    useEffect(() => {
        const cookie = getCookie("playerID");

        if (!isNullOrUndefined(cookie)) {
            socket.emit("join_game", {
                playerID: cookie,
            });
        } else {
            deleteCookie("playerID");
            setLoading(false);
        }
    }, []);

    const updateData = (data) => {
        console.log("updateData", { data });
        if (data.player) {
            setPlayer((prevPlayer) => ({ ...prevPlayer, ...data.player }));
        }
        if (data.game) {
            setGame((prevGame) => ({ ...prevGame, ...data.game }));
        }
        if (data.options) {
            setGame((prevGame) => ({ ...prevGame, options: data.options }));
        }
        if (data.players) {
            setGame((prevGame) => ({ ...prevGame, players: data.players }));
        }
        if (data.timers) {
            setGame((prevGame) => ({ ...prevGame, timers: data.timers }));
        }
    };

    const resetData = () => {
        setPlayer(undefined);
        setGame(undefined);
    };

    const notificationsToRender = [];

    for (let i = 0, len = notifications.length; i < len; i++) {
        const singleNotification = notifications[i];
        const { id, text, type } = singleNotification;

        notificationsToRender.push(
            <Notification
                key={id}
                id={id}
                text={text}
                type={type}
                destroy={hideNotification}
            />
        );
    }

    let content;
    const pathName = useLocation().pathname;

    if (loading) {
        content = (
            <div className="loading-page-spinner-container">
                <div className="loading-text">Ei hätää, sivua ladataan...</div>
                <div className="loading-page-spinner">{getRandomSpinner()}</div>
            </div>
        );
    } else {
        content = (
            <NotificationContextProvider value={notificationParams}>
                {notifications.length > 0 && (
                    <div className="notification-wrapper">
                        {notificationsToRender}
                    </div>
                )}
                <div
                    className={`App ${
                        pathName === "/" ? "background-img" : "mono-background"
                    }`}
                >
                    <div>
                        <div className="basic-grid">
                            <Header
                                game={game}
                                player={player}
                                reset={resetData}
                            />
                            <Switch>
                                <Route
                                    exact
                                    path="/"
                                    render={(props) => (
                                        <Home
                                            startNewGame={startNewGame}
                                            joinExistingGame={joinExistingGame}
                                            history={history}
                                        />
                                    )}
                                />
                                <Route
                                    path="/instructions"
                                    render={(props) => (
                                        <Instructions path={"/instructions"} />
                                    )}
                                />
                                <Route
                                    exact
                                    path="/g/:id"
                                    render={(props) => (
                                        <GameContextProvider
                                            value={{
                                                game,
                                                player,
                                                updateData,
                                            }}
                                        >
                                            <Game
                                                updateData={updateData}
                                                showDebug={showDebug}
                                            />
                                        </GameContextProvider>
                                    )}
                                />
                                <Route
                                    exact
                                    path="/support-us"
                                    render={(props) => (
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                            }}
                                        >
                                            Hmmmm...?
                                            <Button
                                                text={"Takaisin"}
                                                callback={navigate}
                                                callbackParams={"/"}
                                            />
                                        </div>
                                    )}
                                />
                            </Switch>
                        </div>
                        <div className="main-footer">
                            <span className="music-player">
                                <Music />
                            </span>
                            <span className="copyrights" onClick={secretClick}>
                                &copy; {new Date().getFullYear()}
                            </span>
                        </div>
                    </div>
                </div>
            </NotificationContextProvider>
        );
    }

    return content;
};

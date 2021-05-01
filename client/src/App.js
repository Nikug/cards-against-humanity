import React, { useEffect, useState } from "react";
import { Route, Switch, useHistory, useLocation } from "react-router-dom";
import { deleteCookie, setCookie } from "./helpers/cookies";

import "./index.scss";

import { Button } from "./components/button";
import { Game } from "./layouts/Game/Game.jsx";
import { GameContextProvider } from "./contexts/GameContext";
import { Header } from "./components/header";
import { Home } from "./layouts/Home/Home.jsx";
import { Instructions } from "./layouts/Instructions";
import { Notification } from "./components/notification/notification";
import { NotificationContextProvider } from "./contexts/NotificationContext";
import { WholePageLoader } from "./components/WholePageLoader";
import axios from "axios";
import i18n from "./i18n";
import { isNullOrUndefined } from "./helpers/generalhelpers";
import { socket } from "./components/sockets/socket";
import { socketOn } from "./helpers/communicationhelpers";
import { translateCommon } from "./helpers/translation-helpers";
import { useTranslation } from "react-i18next";
import {
    getItemFromLocalStorage,
    LOCAL_STORAGE_FIELDS,
    removeItemFromLocalStorage,
    setItemToLocalStorage,
} from "./helpers/localstoragehelpers";
import { Footer } from "./components/footer/Footer";

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
    const [hasAcceptedCookies, setHasAcceptedCookies] = useState(true);
    const [notificationCount, setNotificationCount] = useState(0);

    const history = useHistory();
    const { t } = useTranslation();

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
        t,
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
        const language = getItemFromLocalStorage(LOCAL_STORAGE_FIELDS.LANGUAGE);

        if (language) {
            i18n.changeLanguage(language);
        }

        /*
        setTimeout(() => {
            //removeItemFromLocalStorage(LOCAL_STORAGE_FIELDS.HAS_ACCEPTED_COOKIES);
            const hasAcceptedCookies = getItemFromLocalStorage(
                LOCAL_STORAGE_FIELDS.HAS_ACCEPTED_COOKIES
            );

            if (hasAcceptedCookies !== "true") {
                const answer = window.confirm(
                    translateCommon("doYouAcceptCookies", t)
                );

                if (answer) {
                    setItemToLocalStorage(
                        LOCAL_STORAGE_FIELDS.HAS_ACCEPTED_COOKIES,
                        "true"
                    );
                } else {
                    setItemToLocalStorage(
                        LOCAL_STORAGE_FIELDS.HAS_ACCEPTED_COOKIES,
                        "false"
                    );
                    setHasAcceptedCookies(false);
                }
            }
        }, 3000);
        */
    }, []);

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
                    console.log("Should remove cookie");
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

        socketOn("notification", null, notificationParams);

        return () => {
            socket.off("update_game_and_players");
            socket.off("disconnect");
            socket.off("notification");
        };
    }, [notificationParams, fireNotification, notificationCount]);

    useEffect(() => {
        const playerID = getItemFromLocalStorage(
            LOCAL_STORAGE_FIELDS.PLAYER_ID
        );

        if (!isNullOrUndefined(player)) {
            socket.emit("join_game", {
                playerID,
            });
        } else {
            removeItemFromLocalStorage(LOCAL_STORAGE_FIELDS.PLAYER_ID);
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
        content = <WholePageLoader />;
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
                        <div className="content">
                            <Header
                                game={game}
                                player={player}
                                reset={resetData}
                            />
                            <div className="main">
                                <Switch>
                                    <Route
                                        exact
                                        path="/"
                                        render={(props) => (
                                            <Home
                                                startNewGame={startNewGame}
                                                joinExistingGame={
                                                    joinExistingGame
                                                }
                                                history={history}
                                            />
                                        )}
                                    />
                                    <Route
                                        path="/instructions"
                                        render={(props) => (
                                            <Instructions
                                                path={"/instructions"}
                                            />
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
                                                    text={translateCommon(
                                                        "back",
                                                        t
                                                    )}
                                                    callback={navigate}
                                                    callbackParams={"/"}
                                                />
                                            </div>
                                        )}
                                    />
                                </Switch>
                            </div>
                            <Footer secretClick={secretClick} />
                        </div>
                    </div>
                </div>
            </NotificationContextProvider>
        );
    }

    if (hasAcceptedCookies === false) {
        return (
            <div
                className="App mono-background"
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                }}
            >
                <div>{translateCommon("doYouAcceptCookies", t)}</div>
                <div>
                    <Button
                        text={translateCommon("accept", t)}
                        callback={() => {
                            setItemToLocalStorage(
                                LOCAL_STORAGE_FIELDS.HAS_ACCEPTED_COOKIES,
                                "true"
                            );
                            setHasAcceptedCookies(true);
                        }}
                    />
                </div>
            </div>
        );
    }

    return content;
};

import "./styles/App.scss";
import "./styles/footer.scss";
import "./styles/notification.scss";

import React, { useEffect, useState } from "react";
import {
    Route,
    BrowserRouter as Router,
    Switch,
    useHistory,
    useLocation,
} from "react-router-dom";
import {
    containsObjectWithMatchingFieldIndex,
    isNullOrUndefined,
} from "./helpers/generalhelpers";
import { deleteCookie, getCookie, setCookie } from "./helpers/cookies";

import { Game } from "./layouts/Game";
import { Header } from "./components/header";
import { Home } from "./layouts/Home";
import Music from "./components/music";
import { Notification } from "./components/notification/notification";
import axios from "axios";
import { socket } from "./components/sockets/socket";
import { Instructions } from "./layouts/Instructions";

export const App = (props) => {
    const [game, setGame] = useState(undefined);
    const [player, setPlayer] = useState(undefined);
    const [notification, setNotification] = useState([]);
    const [loading, setLoading] = useState(true);

    const history = useHistory();

    function startNewGame() {
        axios.post("/g").then((res) => {
            history.push(`/g/${res.data.url}`);
        });
    }

    function joinExistingGame(gameUrl) {
        history.push(`/g/${gameUrl}`);
    }

    const fireNotification = (newNotification, timeInSeconds = 3) => {
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
        socket.on("update_game_and_players", (data) => {
            console.log("update_game_and_players", { data });
            if (data.error) {
                console.log("Received error from server:", data.error);
                setLoading(false);
                return;
            }
            //console.log("Current game:", data.game);
            if (isNullOrUndefined(data.game)) {
                deleteCookie("playerID");
            } else {
                setGame((prevGame) => ({
                    ...prevGame,
                    ...data.game,
                    players: data.players,
                }));
                setPlayer((prevPlayer) => ({ ...prevPlayer, ...data.player }));
                setCookie({ field: "playerID", value: data.player.id });
                history.push(`/g/${data.game.id}`);
            }
            setLoading(false);
        });

        socket.on("disconnect", () => {
            socket.close();
            resetData();
            history.push("/");
        });

        return () => {
            socket.off("update_game_and_players");
        };
    }, []);

    useEffect(() => {
        const cookie = getCookie("playerID");

        if (!isNullOrUndefined(cookie)) {
            socket.emit("join_game", {
                playerID: cookie,
            });
            // setPlayer({ player: { id: cookie } });
        } else {
            deleteCookie("playerID");
            //setCookie({ field: "playerID", value: "random-id-123" });
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

    let content;
    const pathName = useLocation().pathname;

    if (loading) {
        content = <div>loading...</div>;
    } else {
        content = (
            <>
                {!isNullOrUndefined(notification) &&
                    notification.length > 0 && (
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
                                        <Game
                                            game={game}
                                            player={player}
                                            fireNotification={fireNotification}
                                            updateData={updateData}
                                        />
                                    )}
                                />
                            </Switch>
                        </div>
                        <div className="main-footer">
                            <span className="music-player">
                                <Music />
                            </span>
                            <span className="copyrights">
                                &copy; {new Date().getFullYear()}
                            </span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return content;
};

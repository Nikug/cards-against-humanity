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
import { deleteCookie, getCookie, setCookie } from "./helpers/cookies";
import { isNullOrUndefined } from "./helpers/generalhelpers";

export default function App(props) {
    const [isInHome, setIsInHome] = useState(true);
    const [url, setUrl] = useState("");
    const [game, setGame] = useState(undefined);
    const [player, setPlayer] = useState(undefined);

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

    return (
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
    );
}

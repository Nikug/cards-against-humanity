import React, { useEffect, useState } from "react";
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

export default function App(props) {
    const [isInHome, setIsInHome] = useState(true);
    const [url, setUrl] = useState("");

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
    });

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

import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import axios from "axios";

import { Home } from "./layouts/Home";
import { Game } from "./layouts/Game";
import { Header } from "./components/header";
import Music from "./components/music";

import "./styles/App.scss";
import "./styles/footer.scss";

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isInHome: true,
            url: window.location.pathname.slice(
                0,
                window.location.pathname.length - 1
            ),
        };

        this.toggleIsInHome = this.toggleIsInHome.bind(this);
        this.startNewGame = this.startNewGame.bind(this);
        this.joinExistingGame = this.joinExistingGame.bind(this);
        this.resetUrl = this.resetUrl.bind(this);
    }

    toggleIsInHome(isInHome) {
        this.setState({ isInHome });
        if (isInHome) {
            this.resetUrl();
        }
    }

    resetUrl() {
        this.setState({ url: "" });
    }

    startNewGame() {
        axios.post("/g").then((res) => {
            this.setState({ url: res.data.url });
            this.toggleIsInHome(false);
        });
    }

    joinExistingGame(gameUrl) {
        this.setState({ url: gameUrl });
    }

    componentDidMount() {
        this.setState({
            url: window.location.pathname.slice(
                0,
                window.location.pathname.length - 1
            ),
        });
    }

    render() {
        const { isInHome, url } = this.state;

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
                            toggleIsInGame={this.toggleIsInHome}
                        />
                        <Switch>
                            <Route
                                exact
                                path="/"
                                render={(props) => (
                                    <Home
                                        isInGame={!isInHome}
                                        url={url}
                                        startNewGame={this.startNewGame}
                                        joinExistingGame={this.joinExistingGame}
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
                                        resetUrl={this.resetUrl}
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
}

export default App;

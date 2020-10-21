import React, {Component} from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Redirect } from "react-router-dom";
import axios from "axios";

import { Home } from "./layouts/Home";
import { Game } from "./layouts/Game";
import {Header} from "./components/header"

import './styles/App.scss';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isInGame: false,
            url: ''
        }

        this.toggleIsInGame = this.toggleIsInGame.bind(this);
        this.startNewGame = this.startNewGame.bind(this);
        this.joinExistingGame = this.joinExistingGame.bind(this);
        this.resetUrl = this.resetUrl.bind(this);
    }
    
    toggleIsInGame(isInGame) {
        this.setState({isInGame});
        if (!isInGame) {
            this.resetUrl();
        }
    }

    resetUrl() {
        this.setState({url: ''});
    }

    startNewGame() {
        axios.post("/g").then((res) => {
            this.setState({url: res.data.url});
            this.toggleIsInGame(true);
        });
    };

    joinExistingGame(gameUrl) {
        this.setState({url: gameUrl});
    }

    render() {
        console.log({state: this.state});
        return (
            <div className="App">
                <Router>
                <Header isInGame={this.state.isInGame} toggleIsInGame={this.toggleIsInGame}/>
                    <Switch>
                        <Route 
                            exact path="/" 
                            render={(props) => 
                                <Home 
                                    isInGame={this.state.isInGame}
                                    url={this.state.url}
                                    startNewGame={this.startNewGame} 
                                    joinExistingGame={this.joinExistingGame}
                                />
                            } 
                        />
                        <Route 
                            exact path="/g/:id" 
                            render={(props) => <Game isInGame={this.state.isInGame} resetUrl={this.resetUrl}/>} 
                        />
                    </Switch>
                </Router>
            </div>
        );
    }
}

export default App;

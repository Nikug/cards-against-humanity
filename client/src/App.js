import React, {Component} from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import axios from "axios";

import { Home } from "./layouts/Home";
import { Game } from "./layouts/Game";
import { Header } from "./components/header"
import Music from "./components/music";

import './styles/App.scss';
import './styles/footer.scss';

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
        const {isInGame, url} = this.state;

        return (
            <div className={`App ${isInGame ? 'mono-background' : 'background-img'}`}>
                <Router>
                <Header isInGame={isInGame} toggleIsInGame={this.toggleIsInGame}/>
                    <Switch>
                        <Route 
                            exact path="/" 
                            render={(props) => 
                                <Home 
                                    isInGame={isInGame}
                                    url={url}
                                    startNewGame={this.startNewGame} 
                                    joinExistingGame={this.joinExistingGame}
                                />
                            } 
                        />
                        <Route 
                            exact path="/g/:id" 
                            render={(props) => <Game isInGame={isInGame} resetUrl={this.resetUrl}/>} 
                        />
                    </Switch>
                </Router>
                <div className="footer">
                    <Music/>
                    <span className="copyrights">
                        &copy; {new Date().getFullYear()}
                    </span>
                </div>
            </div>
        );
    }
}

export default App;

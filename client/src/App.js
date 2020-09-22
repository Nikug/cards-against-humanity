import React from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { Home } from "./layouts/Home";
import { Game } from "./layouts/Game";

import './App.css';

function App() {
    return (
        <div className="App">
            <Router>
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route exact path="/g/:id" render={props => <Game {...props} />} />
                </Switch>
            </Router>
        </div>
    );
}

export default App;

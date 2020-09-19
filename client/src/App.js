import React from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { Home } from "./components/Home";
import { Game } from "./components/Game";

import './App.css';

function App() {
    return (
        <div className="App">
            <Router>
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route exact path="/g/:id" component={Game} />
                </Switch>
            </Router>
        </div>
    );
}

export default App;

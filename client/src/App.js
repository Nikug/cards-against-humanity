import React from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { Home } from "./components/layouts/Home";
import { Game } from "./layouts/Game";

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

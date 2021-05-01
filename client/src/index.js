import React from "react";
import ReactDOM from "react-dom";
import "./styles/_loadingstyles.scss";
import { App } from "./App";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter as Router } from "react-router-dom";
import "./i18n";
import { Suspense } from "react";
import { WholePageLoader } from "./components/WholePageLoader";

ReactDOM.render(
    <React.StrictMode>
        <Suspense fallback={<WholePageLoader />}>
            <Router>
                <App />
            </Router>
        </Suspense>
    </React.StrictMode>,
    document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

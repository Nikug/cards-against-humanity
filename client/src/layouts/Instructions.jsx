import React, { useState, useEffect } from "react";
import {
    Route,
    BrowserRouter as Router,
    Switch,
    useHistory,
    useLocation,
} from "react-router-dom";

import "../styles/instructions.scss";

const NOT_READY = true;

export const Instructions = ({ path }) => {
    if (NOT_READY) {
        return (
            <div className="instructions-wrapper">
                Ohjeita rakennetaan... Tässä voi mennä hetki!
            </div>
        );
    }

    return (
        <div className="instructions-wrapper">
            <Switch>
                <Route
                    exact
                    path={path}
                    render={(props) => (
                        <div className="title-text-wrapper">
                            <span className="title-text">
                                Haluat oppia, kuinka pelataan kortteja
                                ihmiskuntaa vastaan?
                            </span>
                            <span className="title-text small">
                                Tulit <span className="cursive">tirsk</span>{" "}
                                oikeaan paikkaan!
                            </span>
                        </div>
                    )}
                />
                <Route
                    path={`${path}/demo`}
                    render={(props) => (
                        <div>Tässä on vielä joskus interaktiivinen demo</div>
                    )}
                />
                <Route
                    path={`${path}/about`}
                    render={(props) => (
                        <div>
                            Tässä on vielä joskus tunteita herättävä tarina
                            tästä projektista
                        </div>
                    )}
                />
            </Switch>
        </div>
    );
};

import React from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';

import { Button } from '../components/general/Button.tsx';
import { translateCommon } from '../helpers/translation-helpers';
import { useTranslation } from 'react-i18next';

const NOT_READY = true;

export const Instructions = ({ path }) => {
    const { t } = useTranslation();
    const history = useHistory();
    const currentPath = history.location.pathname;

    if (NOT_READY) {
        return <div className="instructions-wrapper">{translateCommon('instructionsUnderConstruction', t)}!</div>;
    }

    const navigate = (route) => {
        history.push(`${path}${route}`);
    };

    return (
        <div className="instructions-wrapper">
            {currentPath !== path && <Button text={'Takaisin'} callback={navigate} callbackParams={''} />}
            <Switch>
                <Route
                    exact
                    path={path}
                    render={(props) => (
                        <>
                            <div className="title-text-wrapper">
                                <span className="title-text">Haluat siis oppia, kuinka pelataan kortteja ihmiskuntaa vastaan?</span>
                                <span className="title-text small">
                                    Tulit <span className="cursive">tirsk</span> oikeaan paikkaan!
                                </span>
                            </div>
                            <div className="nav-buttons-wrapper">
                                <Button text={'Interaktiivinen demo'} callback={navigate} callbackParams={'/demo'} />
                                <Button text={'Tietoa projektista'} callback={navigate} callbackParams={'/about-us'} />
                            </div>
                        </>
                    )}
                />
                <Route path={`${path}/demo`} render={(props) => <div>Tässä on vielä joskus interaktiivinen demo</div>} />
                <Route path={`${path}/about-us`} render={(props) => <div>Tässä on vielä joskus tunteita herättävä tarina tästä projektista</div>} />
            </Switch>
        </div>
    );
};

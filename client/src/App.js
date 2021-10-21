import './index.scss';

import { LOCAL_STORAGE_FIELDS, getItemFromLocalStorage, removeItemFromLocalStorage } from './helpers/localstoragehelpers';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Route, Switch, useHistory, useLocation } from 'react-router-dom';
import { deleteCookie, setCookie } from './helpers/cookies';
import { resetGame, updateGame } from './actions/gameActions';
import { resetGameSettings, updateGameSettings } from './actions/gameSettingsActions';
import { resetPlayer, updatePlayer } from './actions/playerActions';
import { resetPlayersList, updatePlayersList } from './actions/playersListActions';

import { Button } from './components/general/Button.tsx';
import { Footer } from './components/footer/Footer';
import { Game } from './layouts/Game/Game';
import { Header } from './components/header';
import { Home } from './layouts/Home/Home';
import { Instructions } from './layouts/Instructions';
import { Notification } from './components/notification/notification';
import { NotificationContextProvider } from './contexts/NotificationContext';
import { WholePageLoader } from './components/WholePageLoader';
import axios from 'axios';
import i18n from './i18n';
import { isNullOrUndefined } from './helpers/generalhelpers';
import { socket } from './components/sockets/socket';
import { socketOn } from './helpers/communicationhelpers';
import { translateCommon } from './helpers/translation-helpers';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

export const App = () => {
    /*****************************************************************/ // Purely for hiding dev things from the production.
    const [clicked, setClicked] = useState(0);
    const [showDebug, setShowDebug] = useState(false);

    const secretClick = () => {
        if (clicked > 3) {
            setShowDebug(true);
        } else {
            setClicked(clicked + 1);
        }
    };
    /*****************************************************************/

    const [loading, setLoading] = useState(true);
    const [notificationCount, setNotificationCount] = useState(0);
    const [notifications, setNotifications] = useState([]);

    const history = useHistory();
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const resetData = useCallback(() => {
        dispatch(resetGame());
        dispatch(resetGameSettings());
        dispatch(resetPlayer());
        dispatch(resetPlayersList());
    }, [dispatch]);

    function startNewGame() {
        axios.post('/g').then((res) => {
            history.push(`/g/${res.data.url}`);
        });
    }

    function joinExistingGame(gameUrl) {
        history.push(`/g/${gameUrl}`);
    }

    const navigate = (route) => {
        history.push(`${route}`);
    };

    const getNewId = useCallback(() => {
        const newId = notificationCount + 1;
        setNotificationCount((prevValue) => prevValue + 1);

        return newId;
    }, [notificationCount]);

    const hideNotification = useCallback(
        (id) => {
            const newList = notifications.slice();

            for (let i = 0, len = notifications.length; i < len; i++) {
                const notification = notifications[i];
                if (notification.id === id) {
                    newList.splice(i, 1);
                    break;
                }
            }

            setNotifications(newList);
        },
        [notifications]
    );

    const fireNotification = useCallback(
        (newNotification, timeInSeconds = 4) => {
            const id = getNewId();

            setNotifications((prevValue) => [...prevValue, { ...newNotification, id }]);

            setTimeout(() => {
                hideNotification(id);
            }, timeInSeconds * 1000);
        },
        [getNewId, hideNotification]
    );

    const notificationParams = useMemo(() => {
        return {
            fireNotification,
            notificationCount,
            setNotificationCount,
            t,
        };
    }, [notificationCount, fireNotification, t]);

    useEffect(() => {
        const language = getItemFromLocalStorage(LOCAL_STORAGE_FIELDS.LANGUAGE);

        if (language) {
            i18n.changeLanguage(language);
        }
    }, []);

    useEffect(() => {
        socketOn(
            'update_game_and_players',
            (data) => {
                if (data.error) {
                    console.log('Received error from server:', data.error);
                    setLoading(false);
                    return;
                }
                if (isNullOrUndefined(data.game)) {
                    deleteCookie('playerID');
                } else {
                    dispatch(updateGame(data.game));
                    dispatch(updateGameSettings(data.game.options));
                    dispatch(updatePlayer(data.player));
                    dispatch(updatePlayersList(data.players));

                    setCookie({ field: 'playerID', value: data.player.id });

                    history.push(`/g/${data.game.id}`);
                }
                setLoading(false);
            },
            notificationParams
        );

        socketOn(
            'disconnect',
            () => {
                socket.close();
                resetData();
                history.push('/');
            },
            notificationParams
        );

        socketOn('notification', null, notificationParams);

        return () => {
            socket.off('update_game_and_players');
            socket.off('disconnect');
            socket.off('notification');
        };
    }, [notificationParams, fireNotification, notificationCount, dispatch, resetData, history]);

    useEffect(() => {
        const playerID = getItemFromLocalStorage(LOCAL_STORAGE_FIELDS.PLAYER_ID);

        if (!isNullOrUndefined(playerID)) {
            socket.emit('join_game', {
                playerID,
            });
        } else {
            removeItemFromLocalStorage(LOCAL_STORAGE_FIELDS.PLAYER_ID);
            setLoading(false);
        }
    }, []);

    const notificationsToRender = [];

    for (let i = 0, len = notifications.length; i < len; i++) {
        const singleNotification = notifications[i];
        const { id, text, type } = singleNotification;

        notificationsToRender.push(<Notification key={id} id={id} text={text} type={type} destroy={hideNotification} />);
    }

    let content;
    const pathName = useLocation().pathname;

    if (loading) {
        content = <WholePageLoader />;
    } else {
        content = (
            <NotificationContextProvider value={notificationParams}>
                {notifications.length > 0 && <div className="notification-wrapper">{notificationsToRender}</div>}
                <div className={`App ${pathName === '/' ? 'background-img' : 'mono-background'}`}>
                    <div>
                        <div className="content">
                            <Header />
                            <div className="main">
                                <Switch>
                                    <Route exact path="/" render={() => <Home startNewGame={startNewGame} joinExistingGame={joinExistingGame} />} />
                                    <Route path="/instructions" render={() => <Instructions path={'/instructions'} />} />
                                    <Route exact path="/g/:id" render={() => <Game showDebug={showDebug} />} />
                                    <Route
                                        exact
                                        path="/support-us"
                                        render={() => (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                }}
                                            >
                                                Hmmmm...?
                                                <Button text={translateCommon('back', t)} callback={navigate} callbackParams={'/'} />
                                            </div>
                                        )}
                                    />
                                </Switch>
                            </div>
                            <Footer secretClick={secretClick} />
                        </div>
                    </div>
                </div>
            </NotificationContextProvider>
        );
    }

    return content;
};

import React, { useEffect, useState } from 'react';
import { getCookie, setCookie } from '../../helpers/cookies';

import { GAME_STATES } from '../../consts/gamestates';
import { GameSettingsContainer } from '../../components/game-settings/gamesettingscontainer';
import { HistoryContainer } from './components/GameMenu/history/HistoryContainer';
import { LayerMenu } from '../../components/layer-menu/LayerMenu';
import { PLAYER_STATES } from '../../consts/playerstates';
import { PlayersWidget } from '../../components/players-widget/PlayersWidget';
import { SpectatorsInfo } from './components/SpectatorsInfo/SpectatorsInfo';
import { Timer } from '../../components/timer';
import { TimerV2 } from '../../components/Timer/timerV2';
import { WholePageLoader } from '../../components/WholePageLoader.jsx';
import { getGamePhaseContent } from './getGamePhaseContent';
import { socket } from '../../components/sockets/socket';
import { socketOn } from '../../helpers/communicationhelpers';
import { useNotification } from '../../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { classNames } from '../../helpers/classnames';
import { GameMenuButtonRow } from './components/GameMenu/GameMenuButtonRow';
import { useDispatch, useSelector } from 'react-redux';
import { updatePlayer } from '../../actions/playerActions';
import { updateGame, updateGameTimers } from '../../actions/gameActions';
import { updatePlayersList } from '../../actions/playersListActions';
import { updateGameSettings } from '../../actions/gameSettingsActions';
import { hasTimerInUse } from './helpers/hasTimerInUse';
import { gameIdSelector, gameSelector, gameStateSelector } from '../../selectors/gameSelectors';
import { playerIdSelector, playerSelector } from '../../selectors/playerSelectors';
import { playersListSelector } from '../../selectors/playersListSelectors';
import { gameSettingsSelector } from '../../selectors/gameSettingsSelectors';

export const NAME_CHAR_LIMIT = 50;

export const Game = ({ showDebug }) => {
    // Hooks
    const { t } = useTranslation();
    const dispatch = useDispatch();

    // Contexts
    const notificationParams = useNotification();
    const { fireNotification, notificationCount } = notificationParams;

    // State
    const player = useSelector(playerSelector);
    const game = useSelector(gameSelector);
    const players = useSelector(playersListSelector);
    const options = useSelector(gameSettingsSelector);
    const gameID = useSelector(gameIdSelector);
    const playerID = useSelector(playerIdSelector);
    const gameState = useSelector(gameStateSelector);
    const timerOptions = useSelector((state) => state.gameSettings.value?.timers);

    // States
    const [isLoading, setIsLoading] = useState(false);
    const [gameSettingsMenuOpen, setGameSettingsMenuOpen] = useState(false);
    const [historyMenuOpen, setHistoryMenuOpen] = useState(false);
    const [startingProgress, setStartingProgress] = useState(0);
    const [timerIsOn, setTimerIsOn] = useState(false);
    const [blackCards, setBlackCards] = useState([]);
    const [popularVotedCardsIDs, setPopularVotedCardsIDs] = useState([]);

    // Common consts
    const isLobby = gameState === GAME_STATES.LOBBY;

    // useEffects
    useEffect(() => {
        setIsLoading(false);

        if (!gameID) {
            setIsLoading(true);

            const cookie = getCookie('playerID');

            if (socket.disconnected) {
                socket.open();
            }

            socket.emit('join_game', {
                gameID: getGameIdFromURL(),
                playerID: cookie,
            });
        }
    }, [gameID]);

    useEffect(() => {
        socketOn(
            'update_player',
            (data) => {
                if (data.player) {
                    dispatch(updatePlayer(data.player));
                }

                setCookie({ field: 'playerID', value: data.player.id });
            },
            notificationParams
        );

        socketOn(
            'update_game',
            (data) => {
                if (data.game) {
                    dispatch(updateGame(data.game));
                    dispatch(updateGameSettings(data.game.options));
                }

                setIsLoading(false);
            },
            notificationParams
        );

        socketOn(
            'update_players',
            (data) => {
                if (data.players) {
                    dispatch(updatePlayersList(data.players));
                }
            },
            notificationParams
        );

        socketOn(
            'update_game_options',
            (data) => {
                if (data.options) {
                    dispatch(updateGameSettings(data.options));
                }
            },
            notificationParams
        );

        socketOn(
            'deal_black_cards',
            (data) => {
                setBlackCards(data.blackCards);
            },
            notificationParams
        );

        socketOn(
            'update_timers',
            (data) => {
                if (data.timers) {
                    dispatch(updateGameTimers(data.timers));
                }
            },
            notificationParams
        );

        socketOn(
            'send_popular_voted_cards',
            (data) => {
                setPopularVotedCardsIDs(data.whiteCardIDs);
            },
            notificationParams
        );

        return () => {
            socket.off('update_player');
            socket.off('update_timers');
            socket.off('update_game');
            socket.off('update_players');
            socket.off('update_game_options');
            socket.off('deal_black_cards');
            socket.off('send_popular_voted_cards');
        };
    }, [notificationParams, fireNotification, notificationCount, dispatch]);

    useEffect(() => {
        if (game?.timers?.passedTime && game?.timers?.duration) {
            const { passedTime, duration } = game.timers;
            let currentProgress = (passedTime + 0.1) / duration;
            currentProgress = currentProgress < 0.01 ? 0 : currentProgress;

            setStartingProgress(currentProgress);
        }
        resetTimer();
    }, [game?.state, game?.timers]);

    // This is probably not needed anymore, as listener is in this component too and server sends them automatically
    // Ask for black cards
    // useEffect(() => {
    //     if (game?.state === GAME_STATES.PICKING_BLACK_CARD && player?.isCardCzar) {
    //         socket.emit('draw_black_cards', {
    //             gameID: game.id,
    //             playerID: player.id,
    //         });
    //     }
    // }, [game?.id, game?.state, player?.id, player?.isCardCzar]);

    // Functions
    const getGameIdFromURL = () => {
        const url = window.location.pathname;
        return url.replace('/g/', '');
    };

    const resetTimer = () => {
        setTimerIsOn(false);

        setTimeout(() => {
            setTimerIsOn(true);
        }, 300);
    };

    // Send data to server
    const startGame = (gameID, playerID) => {
        if (!!gameID && !!playerID) {
            socket.emit('start_game', { gameID, playerID });
        }
    };

    const setPlayerName = (name) => {
        const cleanedName = name.trim();

        if (!!player?.id && cleanedName.length > 0) {
            socket.emit('set_player_name', {
                gameID: game?.id,
                playerID: player?.id,
                playerName: cleanedName,
            });
        }
    };

    const givePopularVote = (cardIDs) => {
        socket.emit('give_popular_vote', {
            gameID: game?.id,
            playerID: player?.id,
            whiteCardIDs: cardIDs,
        });
    };

    const togglePlayerMode = () => {
        socket.emit('toggle_player_mode', {
            gameID: game?.id,
            playerID: player?.id,
        });
    };

    const changeCards = () => {
        alert('Korttien vaihtaminen ei ole vielä mahdollista. Odota hetki (jos toinenkin)');
    };

    const returnBackToLobby = () => {
        socket.emit('return_to_lobby', {
            gameID: game?.id,
            playerID: player?.id,
        });
    };

    const openGameSettings = () => {
        setGameSettingsMenuOpen(!gameSettingsMenuOpen);
    };

    const openHistory = () => {
        setHistoryMenuOpen(!historyMenuOpen);
    };

    // Renderin related stuff

    if (isLoading) {
        return <WholePageLoader text={'Pieni hetki, peliä ladataan...'} />;
    }

    const contentProps = {
        t,
        callbacks: {
            setPlayerName,
            givePopularVote,
            togglePlayerMode,
            startGame,
        },
        game,
        player,
        players,
        options,
        blackCards,
        popularVotedCardsIDs,
    };

    const renderedContent = getGamePhaseContent(contentProps);
    const hasProgressInTimer = !isLobby && timerIsOn;
    const hasTimer = hasTimerInUse(gameState, timerOptions);

    return (
        <>
            <div className="game-wrapper-1">
                {gameSettingsMenuOpen && (
                    <LayerMenu
                        content={
                            <GameSettingsContainer
                                options={game ? game.options : {}}
                                gameID={game?.id}
                                disabled={player?.isHost !== true}
                                playerID={player?.id}
                            />
                        }
                        closeLayerMenu={openGameSettings}
                    />
                )}
                {historyMenuOpen && <LayerMenu content={<HistoryContainer />} closeLayerMenu={openHistory} />}
                <GameMenuButtonRow
                    callbacks={{
                        togglePlayerMode,
                        changeCards,
                        returnBackToLobby,
                        openGameSettings,
                        openHistory,
                    }}
                    showDebug={showDebug}
                />
                <div className="info">
                    <PlayersWidget />
                </div>
            </div>
            <div className="game-wrapper-2">
                <div className={classNames('info', { sticky: hasTimer })}>
                    {true && (
                        <Timer
                            width={100}
                            percent={!hasTimer ? 0 : timerIsOn ? 1 : 0}
                            startingPercent={!hasTimer ? 0 : startingProgress}
                            time={game?.timers?.duration ?? 0}
                            empty={!hasTimer}
                        />
                    )}
                    {false && !hasProgressInTimer && (
                        <TimerV2
                            key={
                                'without-progress' // Because life is not easy and css animations are fun, we have to unmount the whole timer component and remount it again to restart the animation (:
                            }
                            width={100}
                            fillToPercent={0}
                            percentToStartFrom={0}
                            time={0}
                        />
                    )}
                    {false && hasProgressInTimer && (
                        <TimerV2
                            key={'with-progress'}
                            width={100}
                            fillToPercent={isLobby ? 0 : timerIsOn ? 100 : 1}
                            percentToStartFrom={isLobby ? 0 : startingProgress * 100}
                            time={game?.timers.duration ?? 0}
                            shouldBlink={player?.state === PLAYER_STATES.PLAYING}
                        />
                    )}
                </div>
                <div className="info">
                    <SpectatorsInfo />
                </div>
                <div className="game-wrapper-3">{renderedContent}</div>
            </div>
        </>
    );
};

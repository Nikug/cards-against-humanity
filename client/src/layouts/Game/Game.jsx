import React, { useEffect, useState } from "react";
import { getCookie, setCookie } from "../../helpers/cookies";

import { GAME_STATES } from "../../consts/gamestates";
import { GameMenu } from "./components/GameMenu/GameMenu";
import { NOTIFICATION_TYPES } from "../../components/notification/notification";
import { PlayersWidget } from "../../components/players-widget/playerswidget";
import { SpectatorsInfo } from "./components/SpectatorsInfo/SpectatorsInfo";
import { Timer } from "../../components/timer";
import { WholePageLoader } from "../../components/WholePageLoader";
import { getGamePhaseContent } from "./getGamePhaseContent";
import { socket } from "../../components/sockets/socket";
import { socketOn } from "../../helpers/communicationhelpers";
import { useGameContext } from "../../contexts/GameContext";
import { useNotification } from "../../contexts/NotificationContext";

export const NAME_CHAR_LIMIT = 50;
export const ICON_CLASSNAMES = "md-36 icon-margin-right";

export const Game = ({ showDebug }) => {
    // Contexts
    const { game, player, updateData } = useGameContext();
    const notificationParams = useNotification();
    const { fireNotification, notificationCount } = notificationParams;

    // States
    const [isLoading, setIsLoading] = useState(false);
    const [startingProgress, setStartingProgress] = useState(0);
    const [timerIsOn, setTimerIsOn] = useState(false);
    const [blackCards, setBlackCards] = useState([]);
    const [popularVotedCardsIDs, setPopularVotedCardsIDs] = useState([]);

    // Common consts
    const isSpectator = player ? player.state === "spectating" : false;
    const isLobby = game?.state === GAME_STATES.LOBBY;

    // useEffects
    useEffect(() => {
        setIsLoading(false);
        if (game === undefined) {
            setIsLoading(true);
            const cookie = getCookie("playerID");
            if (socket.disconnected) {
                console.log("opening socket");
                socket.open();
            }
            socket.emit("join_game", {
                gameID: getGameIdFromURL(),
                playerID: cookie,
            });
        }
    }, [game, player]);

    useEffect(() => {
        socketOn(
            "update_player",
            (data) => {
                setCookie({ field: "playerID", value: data.player.id });
                updateData({ player: data.player });
            },
            notificationParams
        );

        socketOn(
            "update_game",
            (data) => {
                updateData({ game: data.game });
                setIsLoading(false);
            },
            notificationParams
        );

        socketOn(
            "update_players",
            (data) => {
                updateData({ players: data.players });
            },
            notificationParams
        );

        socketOn(
            "update_game_options",
            (data) => {
                updateData({ options: data.options });
            },
            notificationParams
        );

        socketOn(
            "deal_black_cards",
            (data) => {
                setBlackCards(data.blackCards);
            },
            notificationParams
        );

        socketOn(
            "upgrade_to_host",
            (data) => {
                const notification = {
                    text:
                        "Pelin edellinen isäntä lähti, joten sinä olet nyt uusi isäntä!",
                    type: NOTIFICATION_TYPES.DEFAULT,
                    icon: {
                        name: "info",
                        color: "blue",
                        className: "type-icon",
                    },
                };

                fireNotification(notification, 5);
            },
            notificationParams
        );

        socketOn(
            "update_timers",
            (data) => {
                updateData({ timers: data.timers });
            },
            notificationParams
        );

        socketOn(
            "send_popular_voted_cards",
            (data) => {
                setPopularVotedCardsIDs(data.whiteCardIDs);
            },
            notificationParams
        );

        return () => {
            socket.off("update_player");
            socket.off("update_timers");
            socket.off("update_game");
            socket.off("update_players");
            socket.off("update_game_options");
            socket.off("deal_black_cards");
            socket.off("upgrade_to_host");
            socket.off("send_popular_voted_cards");
        };
    }, [notificationParams, fireNotification, notificationCount]);

    useEffect(() => {
        if (game?.timers.passedTime && game?.timers.duration) {
            const { passedTime, duration } = game.timers;
            let currentProgress = (passedTime + 0.1) / duration;
            currentProgress = currentProgress < 0.01 ? 0 : currentProgress;

            setStartingProgress(currentProgress);
        }
        resetTimer();
    }, [game?.state, game?.timers]);

    // Ask for black cards
    useEffect(() => {
        if (
            game?.state === GAME_STATES.PICKING_BLACK_CARD &&
            player?.isCardCzar
        ) {
            socket.emit("draw_black_cards", {
                gameID: game.id,
                playerID: player.id,
            });
        }
    }, []);

    // Functions
    const getGameIdFromURL = () => {
        const url = window.location.pathname;
        return url.replace("/g/", "");
    };

    const resetTimer = () => {
        setTimerIsOn(false);

        setTimeout(() => {
            setTimerIsOn(true);
        }, 100);
    };

    // Send data to server
    const startGame = (gameID, playerID) => {
        if (!!gameID && !!playerID) {
            socket.emit("start_game", { gameID, playerID });
        }
    };

    const setPlayerName = (name) => {
        const cleanedName = name.trim();

        if (!!player?.id && cleanedName.length > 0) {
            socket.emit("set_player_name", {
                gameID: game?.id,
                playerID: player?.id,
                playerName: cleanedName,
            });
        }
    };

    const givePopularVote = (cardIDs) => {
        socket.emit("give_popular_vote", {
            gameID: game?.id,
            playerID: player?.id,
            whiteCardIDs: cardIDs,
        });
    };

    const togglePlayerMode = () => {
        socket.emit("toggle_player_mode", {
            gameID: game?.id,
            playerID: player?.id,
        });
    };

    const returnBackToLobby = () => {
        socket.emit("return_to_lobby", {
            gameID: game?.id,
            playerID: player?.id,
        });
    };

    // Renderin related stuff

    if (isLoading) {
        return <WholePageLoader text={"Pieni hetki, peliä ladataan..."} />;
    }

    const contentProps = {
        callbacks: {
            setPlayerName,
            givePopularVote,
            togglePlayerMode,
            startGame,
        },
        game,
        player,
        blackCards,
        popularVotedCardsIDs,
    };

    const renderedContent = getGamePhaseContent(contentProps);

    return (
        <div>
            <div className="info">
                <PlayersWidget game={game} player={player} />
                <Timer
                    width={100}
                    percent={isLobby ? 0 : timerIsOn ? 1 : 0}
                    startingPercent={isLobby ? 0 : startingProgress}
                    time={game?.timers.duration ?? 0}
                />
                <div className="actions-wrapper">
                    <GameMenu
                        callbacks={{ togglePlayerMode, returnBackToLobby }}
                        showDebug={showDebug}
                    />
                    <SpectatorsInfo />
                </div>
            </div>
            <div className="lobby-container">{renderedContent}</div>
        </div>
    );
};

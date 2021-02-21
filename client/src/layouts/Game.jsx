import "./../styles/game.scss";

import Button, { BUTTON_TYPES } from "../components/button";
import { CONTROL_TYPES, Setting } from "./../components/settings/setting";
import React, { useEffect, useState } from "react";
import { getCookie, setCookie } from "./../helpers/cookies";

import { BlackCardPickerContainer } from "../components/card-picker/blackcardpickercontainer";
import { CardReadingContainer } from "../components/card-picker/cardreadingcontainer";
import { GAME_STATES } from "../consts/gamestates";
import { GameEndContainer } from "../components/card-picker/gameendcontainer";
import { GameSettingsContainer } from "../components/game-settings/gamesettingscontainer";
import { NOTIFICATION_TYPES } from "../components/notification/notification";
import { PlayerName } from "../components/options/PlayerName";
import { PlayersWidget } from "../components/players-widget/playerswidget";
import { RoundEndContainer } from "../components/card-picker/roundendcontainer";
import { Timer } from "../components/timer";
import { WaitingCardPickerContainer } from "../components/card-picker/waitincardpickercontainer";
import { WhiteCardPickerContainer } from "../components/card-picker/whitecardpickercontainer";
import { WinnerCardPickerContainer } from "../components/card-picker/winnercardpickercontainer";
import { socket } from "../components/sockets/socket";

export function Game(props) {
    const { game, player } = props;
    const [startingProgress, setStartingProgress] = useState(0);
    const [timerIsOn, setTimerIsOn] = useState(false);
    const [blackCards, setBlackCards] = useState([]);
    const [popularVotedCardsIDs, setPopularVotedCardsIDs] = useState([]);

    const { fireNotification, updateData } = props;

    const getGameIdFromURL = () => {
        const url = window.location.pathname;
        return url.replace("/g/", "");
    };

    useEffect(() => {
        if (game === undefined) {
            const cookie = getCookie("playerID");
            if (socket.disconnected) {
                console.log("opening socket");
                socket.open();
            }
            socket.emit("join_game", {
                gameID: getGameIdFromURL(),
                playerID: cookie,
            });
            console.log(
                "joining game!",
                cookie,
                "socket",
                socket,
                "game",
                game
            );
        }
    }, [game, player]);

    useEffect(() => {
        socket.on("send_popular_voted_cards", (data) => {
            console.log("socket send_popular_voted_cards", data);
            setPopularVotedCardsIDs(data.whiteCardIDs);
        });

        return () => {
            socket.off("send_popular_voted_cards");
        };
    }, []);

    useEffect(() => {
        socket.on("update_player", (data) => {
            console.log("socket update_player", data);

            setCookie({ field: "playerID", value: data.player.id });
            updateData({ player: data.player });
        });

        socket.on("update_game", (data) => {
            console.log("socket update_game", data);
            updateData({ game: data.game });
        });

        socket.on("update_players", (data) => {
            console.log("socket update_players", data);
            updateData({ players: data.players });
        });

        socket.on("update_game_options", (data) => {
            updateData({ options: data.options });
        });

        socket.on("deal_black_cards", (data) => {
            console.log("Received black cards from socket", data.blackCards);
            setBlackCards(data.blackCards);
        });

        socket.on("upgrade_to_host", (data) => {
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
        });

        return () => {
            socket.off("update_player");
            socket.off("update_game");
            socket.off("update_players");
            socket.off("update_game_options");
            socket.off("deal_black_cards");
            socket.off("upgrade_to_host");
        };
    }, []);

    const resetTimer = () => {
        setTimerIsOn(false);

        setTimeout(() => {
            setTimerIsOn(true);
        }, 100);
    };

    useEffect(() => {
        if (game?.timers.passedTime && game?.timers.duration) {
            const { passedTime, duration } = game.timers;
            let currentProgress = (passedTime + 0.1) / duration;
            currentProgress = currentProgress < 0.01 ? 0 : currentProgress;

            setStartingProgress(currentProgress);
            console.log("Set progress to", currentProgress);

            resetTimer();
        }
    }, [game?.state, game?.timers]);

    // New window is opened for the same user in an existing game
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

    const startGame = (gameID, playerID) => {
        if (!!gameID && !!playerID) {
            socket.emit("start_game", { gameID, playerID });
        }
    };

    //console.log(`Is socket still open: ${socket.connected ? "Yes" : "No"}`);

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
        console.log("POPULAR VOTE", cardIDs);
        socket.emit("give_popular_vote", {
            gameID: game?.id,
            playerID: player?.id,
            whiteCardIDs: cardIDs,
        });
    };

    const iconClassnames = "md-36 icon-margin-right";
    const canStartGame =
        game?.players?.length > 0 && game?.options?.cardPacks?.length > 0; // TODO: Why is player name not there? Player is not updated by back-end
    console.log("game.state", game?.state);
    //console.log("game.client.options", game?.client?.options);

    const defaultContent = (
        <div className="error-info">
            Something went wrong. Try to reload the page.
        </div>
    );

    const gameState = game?.state;
    let renderedContent;

    if (player?.isCardCzar) {
        switch (gameState) {
            case GAME_STATES.LOBBY:
                renderedContent = (
                    <>
                        <div className="info">
                            <div className="game-settings-container">
                                <div className="nick-and-start-container">
                                    <div className="nickname-selector">
                                        <Setting
                                            text={"Nimimerkki"}
                                            placeholderText={"nimimerkki"}
                                            controlType={
                                                CONTROL_TYPES.textWithConfirm
                                            }
                                            onChangeCallback={setPlayerName}
                                            icon={{
                                                name: "person",
                                                className: iconClassnames,
                                            }}
                                            charLimit={35}
                                            customButtonIcon={"login"}
                                        />
                                    </div>
                                    {player?.isHost && (
                                        <Button
                                            icon={"play_circle_filled"}
                                            iconPosition={"after"}
                                            text={"Aloita peli"}
                                            type={BUTTON_TYPES.GREEN}
                                            additionalClassname={"big-btn"}
                                            callback={() =>
                                                startGame(game?.id, player?.id)
                                            }
                                            disabled={
                                                !canStartGame ||
                                                player?.isHost !== true
                                            }
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="info">
                            <GameSettingsContainer
                                options={game ? game.options : {}}
                                gameID={game?.id}
                                isHost={player?.isHost}
                                isDisabled={player?.isHost !== true}
                                playerID={player?.id}
                            />
                        </div>
                    </>
                );
                break;
            case GAME_STATES.PICKING_BLACK_CARD:
                renderedContent = (
                    <BlackCardPickerContainer
                        player={player}
                        game={game}
                        blackCards={blackCards}
                    />
                );
                break;
            case GAME_STATES.PLAYING_WHITE_CARDS:
                renderedContent = (
                    <WaitingCardPickerContainer
                        player={player}
                        game={game}
                        alternativeText={
                            "Muut valitsevat valkoisia korttejaan..."
                        }
                        showMainCard={true}
                        noBigMainCard={true}
                    />
                );
                break;
            case GAME_STATES.READING_CARDS:
                renderedContent = (
                    <CardReadingContainer player={player} game={game} />
                );
                break;
            case GAME_STATES.SHOWING_CARDS:
                renderedContent = (
                    <WinnerCardPickerContainer
                        player={player}
                        game={game}
                        givePopularVote={givePopularVote}
                        popularVotedCardsIDs={popularVotedCardsIDs}
                    />
                );
                break;
            case GAME_STATES.ROUND_END:
                renderedContent = (
                    <RoundEndContainer
                        player={player}
                        game={game}
                        givePopularVote={givePopularVote}
                        popularVotedCardsIDs={popularVotedCardsIDs}
                    />
                );
                break;
            case GAME_STATES.GAME_OVER:
                renderedContent = (
                    <GameEndContainer player={player} game={game} />
                );
                break;
            default:
                renderedContent = defaultContent;
                break;
        }
    } else {
        if (gameState !== "lobby" && player?.state === "pickingName") {
            renderedContent = (
                <PlayerName gameID={game?.id} playerID={player?.id} />
            );
            renderedContent = (
                <div className="info">
                    <div className="game-settings-container">
                        <div className="nick-and-start-container">
                            <div className="nickname-selector">
                                <Setting
                                    text={"Nimimerkki"}
                                    placeholderText={"nimimerkki"}
                                    controlType={CONTROL_TYPES.textWithConfirm}
                                    onChangeCallback={setPlayerName}
                                    icon={{
                                        name: "person",
                                        className: iconClassnames,
                                    }}
                                    charLimit={35}
                                    customButtonIcon={"login"}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            switch (gameState) {
                case GAME_STATES.LOBBY:
                    renderedContent = (
                        <>
                            <div className="info">
                                <div className="game-settings-container">
                                    <div className="nick-and-start-container">
                                        <div className="nickname-selector">
                                            <Setting
                                                text={"Nimimerkki"}
                                                placeholderText={"nimimerkki"}
                                                controlType={
                                                    CONTROL_TYPES.textWithConfirm
                                                }
                                                onChangeCallback={setPlayerName}
                                                icon={{
                                                    name: "person",
                                                    className: iconClassnames,
                                                }}
                                                charLimit={35}
                                                customButtonIcon={"login"}
                                            />
                                        </div>
                                        {player?.isHost && (
                                            <Button
                                                icon={"play_circle_filled"}
                                                iconPosition={"after"}
                                                text={"Aloita peli"}
                                                type={BUTTON_TYPES.GREEN}
                                                additionalClassname={"big-btn"}
                                                callback={() =>
                                                    startGame(
                                                        game?.id,
                                                        player?.id
                                                    )
                                                }
                                                disabled={
                                                    !canStartGame ||
                                                    player?.isHost !== true
                                                }
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="info">
                                <GameSettingsContainer
                                    options={game ? game.options : {}}
                                    gameID={game?.id}
                                    isHost={player?.isHost}
                                    isDisabled={player?.isHost !== true}
                                    playerID={player?.id}
                                />
                            </div>
                        </>
                    );
                    break;
                case GAME_STATES.PICKING_BLACK_CARD:
                    const cardCzarName = game.players.filter(
                        (player) => player.isCardCzar === true
                    )[0].name;
                    renderedContent = (
                        <div>
                            <WaitingCardPickerContainer
                                player={player}
                                game={game}
                                alternativeText={`${cardCzarName} valitsee mustaa korttia...`}
                                showMainCard={false}
                            />
                        </div>
                    );
                    break;
                case GAME_STATES.PLAYING_WHITE_CARDS:
                    if (!player) {
                        renderedContent = defaultContent;
                    } else {
                        renderedContent = (
                            <WhiteCardPickerContainer
                                player={player}
                                game={game}
                            />
                        );
                    }
                    break;
                case GAME_STATES.READING_CARDS:
                    renderedContent = (
                        <CardReadingContainer player={player} game={game} />
                    );
                    break;
                case GAME_STATES.SHOWING_CARDS:
                    renderedContent = (
                        <div>
                            <WinnerCardPickerContainer
                                player={player}
                                game={game}
                                givePopularVote={givePopularVote}
                                popularVotedCardsIDs={popularVotedCardsIDs}
                            />
                        </div>
                    );
                    break;
                case GAME_STATES.ROUND_END:
                    renderedContent = (
                        <RoundEndContainer
                            player={player}
                            game={game}
                            givePopularVote={givePopularVote}
                            popularVotedCardsIDs={popularVotedCardsIDs}
                        />
                    );
                    break;
                case GAME_STATES.GAME_OVER:
                    renderedContent = (
                        <GameEndContainer player={player} game={game} />
                    );
                    break;
                default:
                    renderedContent = defaultContent;
                    break;
            }
        }
    }

    return (
        <div>
            <div className="info">
                <PlayersWidget game={game} player={player} />
                <Timer
                    width={100}
                    percent={timerIsOn ? 1 : 0}
                    startingPercent={startingProgress}
                    time={game?.timers.duration ?? 0}
                />
            </div>
            <div className="lobby-container">{renderedContent}</div>
        </div>
    );
}

import React, { useState, useEffect } from "react";
import { socket } from "../components/sockets/socket";

import { PlayersWidget } from "../components/players-widget/playerswidget";
import { GameSettingsContainer } from "../components/game-settings/gamesettingscontainer";
import { Timer } from "../components/timer";
import Button, { BUTTON_TYPES } from "../components/button";
import { Setting, CONTROL_TYPES } from "./../components/settings/setting";
import { setCookie } from "./../helpers/cookies";

import "./../styles/game.scss";
import { GAME_STATES } from "../consts/gamestates";
import { BlackCardPickerContainer } from "../components/card-picker/blackcardpickercontainer";
import { WhiteCardPickerContainer } from "../components/card-picker/whitecardpickercontainer";
import { WinnerCardPickerContainer } from "../components/card-picker/winnercardpickercontainer";
import { WaitingCardPickerContainer } from "../components/card-picker/waitincardpickercontainer";
import { CardReadingContainer } from "../components/card-picker/cardreadingcontainer";
import { RoundEndContainer } from "../components/card-picker/roundendcontainer";
import { textToSpeech } from "../helpers/generalhelpers";
import { NOTIFICATION_TYPES } from "../components/notification/notification";

export function Game(props) {
    const [game, setGame] = useState(props.game);
    const [player, setPlayer] = useState(props.player);
    const [progress, setProgress] = useState(0);
    const [blackCards, setBlackCards] = useState([]);
    const [popularVotedCardsIDs, setPopularVotedCardsIDs] = useState([]);

    const { fireNotification, updateData } = props;

    const getGameIdFromURL = () => {
        const url = window.location.pathname;
        return url.replace("/g/", "");
    };

    useEffect(() => {
        window.addEventListener("beforeunload", () => {
            if (!!game && !!player) {
                socket.emit("leave_game", {
                    gameID: game.id,
                    playerID: player.id,
                });
            }
        });

        if (game === undefined) {
            socket.emit("join_game", {
                gameID: getGameIdFromURL(),
                playerID: player?.id,
            });
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

            setPlayer(data.player);

            setCookie({ field: "playerID", value: data.player.id });
            updateData({ player: data.player });
        });

        socket.on("update_game", (data) => {
            console.log("socket update_game", data);
            setGame((prevGame) => ({ ...prevGame, ...data.game }));
            updateData({ game: data.game });
        });

        socket.on("update_players", (data) => {
            console.log("socket update_players", data);
            setGame((prevGame) => ({ ...prevGame, players: data.players }));
            updateData({ players: data.players });
        });

        socket.on("update_game_and_players", (data) => {
            console.log("socket update_game_and_players", data);

            setGame((prevGame) => ({
                ...prevGame,
                ...data.game,
                players: data.players,
            }));
            setPlayer(data.player);

            setCookie({ field: "playerID", value: data.player.id });
            updateData({
                game: data.game,
                player: data.player,
                players: data.players,
            });
        });

        socket.on("update_game_options", (data) => {
            console.log("socket update_game_options", data);
            setGame((prevGame) => ({ ...prevGame, options: data.options }));

            updateData({ game: { ...game, options: data.options } });
        });

        socket.on("deal_black_cards", (data) => {
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
    }, []);

    const startGame = (gameID, playerID) => {
        if (!!gameID && !!playerID) {
            socket.emit("start_game", { gameID, playerID });
        }
    };

    //console.log(`Is socket still open: ${socket.connected ? "Yes" : "No"}`);

    const addProgress = () => {
        //console.log(progress);
        if (progress < 0.95) {
            setProgress(progress + 1);
            return;
        }

        setProgress(0);
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
                                            placeholderText={"nickname"}
                                            controlType={
                                                CONTROL_TYPES.textWithConfirm
                                            }
                                            onChangeCallback={setPlayerName}
                                            icon={{
                                                name: "person",
                                                className: iconClassnames,
                                            }}
                                            charLimit={35}
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
            default:
                renderedContent = (
                    <div className="error-info">
                        Something went wrong. Try to reload the page.
                    </div>
                );
                break;
        }
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
                                            placeholderText={"nickname"}
                                            controlType={
                                                CONTROL_TYPES.textWithConfirm
                                            }
                                            onChangeCallback={setPlayerName}
                                            icon={{
                                                name: "person",
                                                className: iconClassnames,
                                            }}
                                            charLimit={35}
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
                    <div>
                        <WaitingCardPickerContainer
                            player={player}
                            game={game}
                            alternativeText={
                                "Korttikuningas valitsee korttia..."
                            }
                            showMainCard={false}
                        />
                    </div>
                );
                break;
            case GAME_STATES.PLAYING_WHITE_CARDS:
                renderedContent = (
                    <WhiteCardPickerContainer player={player} game={game} />
                );
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
            default:
                renderedContent = (
                    <div className="error-info">
                        Something went wrong. Try to reload the page.
                    </div>
                );
                break;
        }
    }

    return (
        <div>
            <div className="info">
                <PlayersWidget game={game} player={player} />
                <Timer
                    width={100}
                    percent={progress}
                    startingPercent={0}
                    time={10}
                />
            </div>
            <div className="lobby-container">{renderedContent}</div>
        </div>
    );
}

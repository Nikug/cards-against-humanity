import React, { useState, useEffect } from "react";
import { socket } from "../components/sockets/socket";

import { PlayersWidget } from "../components/players-widget/playerswidget";
import { GameSettingsContainer } from "../components/game-settings/gamesettingscontainer";
import { Timer } from "../components/timer";
import Button, { BUTTON_TYPES } from "../components/button";
import { Setting, CONTROL_TYPES } from "./../components/settings/setting";

import "./../styles/game.scss";
import { GAME_STATES } from "../consts/gamestates";
import { CardPicker } from "../components/card-picker/cardpicker";
import { getBlackCard, getWhiteCard } from "../fakedata/fakecarddata";
import { emptyFn } from "../helpers/generalhelpers";
import { BlackCardPickerContainer } from "../components/card-picker/blackcardpickercontainer";
import { WhiteCardPickerContainer } from "../components/card-picker/whitecardpickercontainer";
import { WinnerCardPickerContainer } from "../components/card-picker/winnercardpickercontainer";
import { WaitingCardPickerContainer } from "../components/card-picker/waitincardpickercontainer";
import { CardReadingContainer } from "../components/card-picker/cardreadingcontainer";

export const Game = (props) => {
    const [game, setGame] = useState(undefined);
    const [player, setPlayer] = useState(undefined);
    const [progress, setProgress] = useState(0);

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
            socket.emit("join_game", { gameID: getGameIdFromURL() });
        }

        return () => window.removeEventListener("beforeunload", () => {});
    }, [game, player]);

    useEffect(() => {
        socket.on("update_player", (data) => {
            setPlayer(data.player);
        });

        socket.on("update_game", (data) => {
            setGame((prevGame) => ({ ...prevGame, ...data.game }));
        });

        socket.on("update_players", (data) => {
            console.log("players updated!");
            setGame((prevGame) => ({ ...prevGame, players: data.players }));
        });

        socket.on("update_game_options", (data) => {
            setGame((prevGame) => ({ ...prevGame, options: data.options }));
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const startGame = (gameID, playerID) => {
        console.log({ gameID, playerID });
        if (!!gameID && !!playerID) {
            socket.emit("start_game", { gameID, playerID });
        }
    };

    //console.log(`Is socket still open: ${socket.connected ? "Yes" : "No"}`);
    if (game) {
        //console.log("game.id", game.id);
    } else {
        //console.log("was no game");
    }

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

        //console.log('setPlayerName', {name, cleanedName}, game?.id, player?.id);

        if (!!player?.id && cleanedName.length > 0) {
            socket.emit("set_player_name", {
                gameID: game?.id,
                playerID: player?.id,
                playerName: cleanedName,
            });
        }
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
                                        />
                                    </div>
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
                        <BlackCardPickerContainer player={player} game={game} />
                    </div>
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
                    <WinnerCardPickerContainer player={player} game={game} />
                );
                break;
            case GAME_STATES.ROUND_END:
                renderedContent = <div>round end lol xd</div>;
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
                                        />
                                    </div>
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
                        <WaitingCardPickerContainer
                            player={player}
                            game={game}
                            alternativeText={
                                "Korttikuningas valitsee voittajaa..."
                            }
                            gameState={GAME_STATES.SHOWING_CARDS}
                        />
                    </div>
                );
                break;
            case GAME_STATES.ROUND_END:
                renderedContent = <div>round end lol xd</div>;
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
                    startingPercent={0.4}
                    time={10}
                />
            </div>
            <div className="lobby-container">{renderedContent}</div>
        </div>
    );

    return (
        <div>
            <div className="info">
                <PlayersWidget game={game} player={player} />
                <Timer
                    width={100}
                    percent={progress}
                    startingPercent={0.4}
                    time={10}
                />
            </div>
            <div className="lobby-container">
                <div
                    hidden={false}
                    style={{ marginTop: "2rem", marginBottom: "2rem" }}
                    className="info"
                >
                    <Button text="try the timer" callback={addProgress} />
                </div>
                <div
                    className="info"
                    hidden={game?.state !== GAME_STATES.LOBBY}
                >
                    <div className="game-settings-container">
                        <div className="nick-and-start-container">
                            <div className="nickname-selector">
                                <Setting
                                    text={"Nimimerkki"}
                                    placeholderText={"nickname"}
                                    controlType={CONTROL_TYPES.textWithConfirm}
                                    onChangeCallback={setPlayerName}
                                    icon={{
                                        name: "person",
                                        className: iconClassnames,
                                    }}
                                />
                            </div>
                            <Button
                                icon={"play_circle_filled"}
                                iconPosition={"after"}
                                text={"Aloita peli"}
                                type={BUTTON_TYPES.GREEN}
                                additionalClassname={"big-btn"}
                                callback={() => startGame(game?.id, player?.id)}
                                disabled={!canStartGame}
                            />
                        </div>
                    </div>
                </div>
                <div
                    className="info"
                    hidden={game?.state !== GAME_STATES.LOBBY}
                >
                    <GameSettingsContainer
                        options={game ? game.options : {}}
                        gameID={game?.id}
                        isHost={player?.isHost}
                        playerID={player?.id}
                    />
                </div>

                <div
                    hidden={
                        game?.state !== GAME_STATES.PICKING_BLACK_CARD &&
                        game?.state !== GAME_STATES.PLAYING_WHITE_CARDS &&
                        game?.state !== GAME_STATES.READING_CARDS &&
                        game?.state !== GAME_STATES.SHOWING_CARDS &&
                        game?.state !== GAME_STATES.ROUND_END
                    }
                >
                    <BlackCardPickerContainer player={player} game={game} />
                    {false && (
                        <CardPicker
                            mainCard={getBlackCard()}
                            selectableCards={[
                                getWhiteCard(0),
                                getWhiteCard(1),
                                getWhiteCard(2),
                                getWhiteCard(2),
                                getWhiteCard(2),
                                getWhiteCard(2),
                            ]}
                            selectedCards={[getWhiteCard(0)]}
                            confirmedCards={[getWhiteCard(1)]}
                            selectCard={emptyFn}
                            confirmCards={emptyFn}
                        />
                    )}
                </div>

                {/*
                <div hidden={true}>
                    <h1 style={{ textTransform: "capitalize" }}>{`Game ${
                        game === undefined ? " not found" : game.id.replace(/-/g, " ")
                    }`}</h1>
                    {!!game && (
                        <div>
                            <PlayerName gameID={game.id} playerID={player?.id} />
                        </div>
                    )}
                    {!!game && (
                        <div>
                            {game.state === "lobby" && (
                                <div>
                                    <GameOptions
                                        options={game?.options}
                                        gameID={game?.id}
                                        isHost={player?.isHost}
                                        playerID={player?.id}
                                    />
                                </div>
                            )}

                            {!!player?.isHost && game.state === "lobby" && (
                                <div>
                                    <button
                                        onClick={() => startGame(game?.id, player?.id)}
                                    >
                                        Aloita peli
                                    </button>
                                </div>
                            )}

                            {game.state === "pickingBlackCard" && (
                                <BlackCardPicker gameID={game.id} player={player} />
                            )}
                            {game.state === "playingWhiteCards" && (
                                <WhiteCardPicker
                                    gameID={game.id}
                                    player={player}
                                    pickLimit={
                                        game.rounds[game.rounds.length - 1].blackCard
                                            .whiteCardsToPlay
                                    }
                                />
                            )}

                            <div style={{ display: "inline-block" }}>
                                <pre>{JSON.stringify(game, null, 2)}</pre>
                            </div>
                            <div style={{ display: "inline-block" }}>
                                <pre>{JSON.stringify(player, null, 2)}</pre>
                            </div>
                        </div>
                    )}
                </div>
                                */}
            </div>
        </div>
    );
};

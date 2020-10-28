import React, { useState, useEffect } from "react";
import { socket } from "../components/sockets/socket";
import { Redirect } from "react-router-dom";

import { GameOptions } from "../components/options/GameOptions";
import { PlayerName } from "../components/options/PlayerName";
import { BlackCardPicker } from "../components/views/BlackCardPicker";
import { PlayersWidget } from "../components/players-widget/playerswidget";
import { GameSettingsContainer } from "../components/game-settings/gamesettingscontainer";
import { Timer } from "../components/timer";
import Button, { BUTTON_TYPES } from "../components/button";

import "./../styles/game.scss";

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
            console.log("Game updated!");
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
        if (!!gameID && !!playerID) {
            socket.emit("start_game", { gameID: gameID, playerID });
        }
    };

    console.log(`Is socket still open: ${socket.connected ? "Yes" : "No"}`);
    if (game) {
    console.log('game.id', game.id);
    } else {
        console.log('was no game');
    }

    const addProgress = () => {
        console.log(progress);
        if (progress < 0.95) {
        setProgress(progress + 1)
        return;
        }

        setProgress(0)
    }

    return (
        <div>
            <div className="info">
                <PlayersWidget />
                <Timer width={100} percent={progress} startingPercent={0.4} time={10}/>
            </div>
            <div style={{marginTop: '2rem', marginBottom: '2rem'}} className="info">
                <Button text="try the timer" callback={addProgress} />
            </div>
            <div className="info">
                <GameSettingsContainer />
            </div>
            <h1 style={{ textTransform: "capitalize" }}>{`Game ${
                game === undefined ? " not found" : game.id.replace(/-/g, ' ')
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

                    {game.state === "pickingBlackCard" &&
                        <BlackCardPicker gameID={game.id} player={player} />
                    }

                    <div style={{ display: "inline-block" }}>
                        <pre>{JSON.stringify(game, null, 2)}</pre>
                    </div>
                    <div style={{ display: "inline-block" }}>
                        <pre>{JSON.stringify(player, null, 2)}</pre>
                    </div>
                </div>
            )}
        </div>
    );
};

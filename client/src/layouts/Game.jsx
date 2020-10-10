import React, { useState, useEffect } from "react";
import { socket } from "../components/sockets/socket";

import { GameOptions } from "../components/options/GameOptions";
import { PlayerName } from "../components/options/PlayerName";

export const Game = () => {
    const [game, setGame] = useState(undefined);
    const [player, setPlayer] = useState(undefined);

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
            socket.emit("start_game", { gameID: gameID, playerID, playerID });
        }
    };

    console.log(`Is socket still open: ${socket.connected ? "Yes" : "No"}`);

    return (
        <div>
            <h1 style={{ textTransform: "capitalize" }}>{`Game ${
                game === undefined ? " not found" : game.id.replaceAll("-", " ")
            }`}</h1>
            {!!game && (
                <div>
                    <PlayerName gameID={game.id} playerID={player?.id} />
                </div>
            )}
            {!!game && (
                <div>
                    <div>
                        <GameOptions
                            options={game?.options}
                            gameID={game?.id}
                            isHost={player?.isHost}
                            playerID={player?.id}
                        />
                    </div>
                    {!!player?.isHost && (
                        <div>
                            <button
                                onClick={() => startGame(game?.id, player?.id)}
                            >
                                Aloita peli
                            </button>
                        </div>
                    )}
                    <pre>{JSON.stringify(game, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

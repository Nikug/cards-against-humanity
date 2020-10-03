import React, { useState, useEffect } from "react";
import { socket } from "../components/sockets/socket";

import { GameOptions } from "../components/options/GameOptions";
import { PlayerName } from "../components/options/PlayerName";

export const Game = () => {
    const [game, setGame] = useState(undefined);
    const [playerID, setPlayerID] = useState(undefined);

    const getGameIdFromURL = () => {
        const url = window.location.pathname;
        return url.replace("/g/", "");
    };

    useEffect(() => {
        window.addEventListener("beforeunload", () => {
            socket.emit("leave_game", { gameID: game.id, playerID: playerID });
        });

        if (game === undefined) {
            socket.emit("join_game", { gameID: getGameIdFromURL() });
        }

        return () => window.removeEventListener("beforeunload", () => {});
    }, [game, playerID]);

    useEffect(() => {
        socket.on("update_player", (data) => {
            setPlayerID(data.player.id);
        });


        socket.on("update_game", (data) => {
            console.log("Game updated!");
            setGame(data.game);
        });

        socket.on("update_player_name", (data) => {
            console.log("player name updated!");
            setGame((prevGame) => ({ ...prevGame, players: data.players }));
        });

        socket.on("update_game_options", (data) => {
            console.log("is this even happening???");
            setGame((prevGame) => ({ ...prevGame, options: data.options }));
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    console.log(`Is socket still open: ${socket.connected ? "Yes" : "No"}`);

    return (
        <div>
            <h1>{`Game ${game === undefined ? " not found" : game.url}`}</h1>
            {!!game && (
                <div>
                    <PlayerName gameID={game.id} playerID={playerID} />
                </div>
            )}
            {!!game && (
                <div>
                    <div>
                        <GameOptions
                            options={game?.options}
                            gameID={game?.id}
                        />
                    </div>
                    <pre>{JSON.stringify(game, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

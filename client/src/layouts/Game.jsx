import React, { useState, useEffect } from "react";
import { socket } from "../components/sockets/socket";

import { GameOptions } from "../components/options/GameOptions";
import { PlayerName } from "../components/options/PlayerName";

export const Game = () => {
    const [game, setGame] = useState(undefined);
    const [playerID, setPlayerID] = useState(socket.id);

    const getGameIdFromURL = () => {
        const url = window.location.pathname;
        return url.replace("/g/", "");
    };

    useEffect(() => {
        if (game === undefined) {
            socket.emit("join_game", getGameIdFromURL());
        }
    }, [game]);

    useEffect(() => {
        socket.on("update_player", (data) => {

        });

        socket.on("update_game", (data) => {
            console.log("Game updated!");
            setGame(data.game);
        });
    
        socket.on("update_player_name", (players) => {
            console.log("player name updated!");
            setGame(state => ({ ...state, players: players }));
        });
    }, []);

    // Do this when closing page, switching page etc.
    // socket.emit("leave_game", { id: game.id, playerID: playerID });

    useEffect(() => {
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
                    <PlayerName id={game.id} playerID={playerID} />
                </div>
            )}
            {!! game &&
                <div>
                    <div>
                        <GameOptions options={game?.options} id={game?.id} />
                    </div>
                    <pre>{JSON.stringify(game, null, 2)}</pre>
                </div>
            }
        </div>
    );
};

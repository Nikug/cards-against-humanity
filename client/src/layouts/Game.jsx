import React, { useState, useEffect } from "react";
import { socket } from "../components/sockets/socket";

import { GameOptions } from "../components/options/GameOptions";

export const Game = () => {
    const [game, setGame] = useState(undefined);

    const getGameIdFromURL = () => {
        const url = window.location.pathname;
        return url.replace("/g/", "");
    };

    useEffect(() => {
        if (game === undefined) {
            socket.emit("join_game", getGameIdFromURL());
        }
        socket.on("update_game", (data) => {
            setGame(data);
        });
    }, [game]);

    useEffect(() => {
        return () => socket.disconnect();
    }, [])

    return (
        <div>
            <h1>{`Game ${game === undefined ? " not found" : game.url}`}</h1>
            <div>
                <GameOptions options={game?.options} id={game?.id} />
            </div>
            <pre>{JSON.stringify(game, null, 2)}</pre>
        </div>
    );
};

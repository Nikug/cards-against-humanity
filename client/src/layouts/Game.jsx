import React, { useState, useEffect } from "react";
import io from "socket.io-client";

export const Game = () => {
    const [game, setGame] = useState(undefined);

    const getGameIdFromURL = () => {
        const url = window.location.pathname;
        return url.replace("/g/", "");
    }

    useEffect(() => {
        const socket = io();
        if(game === undefined) {
            socket.emit("join_game", getGameIdFromURL());
        }
        socket.on("update_game", data => {
            setGame(data);
        });
        return () => socket.disconnect();
    }, [game]);

    return(
        <div>
            <p>{`Game ${game === undefined ? " not found" : game.url}`}</p>
            <p>{JSON.stringify(game)}</p>
        </div>

    );
}
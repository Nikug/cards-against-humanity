import React, { useState, useEffect } from "react";
import io from "socket.io-client";

// const SOCKET_URL = "http://localhost:3000";

export const Game = (props) => {
    const [game, setGame] = useState(props.location.state);

    useEffect(() => {
        const socket = io();
        socket.emit("join_game", game.id);
        socket.on("FromAPI", data => {
            console.log("connection to server");
        });
        return () => socket.disconnect();
    }, []);

    return(
        <div>
            <p>{`Game ${props.match.params.id}`}</p>
            <p>{JSON.stringify(game)}</p>
        </div>

    );
}
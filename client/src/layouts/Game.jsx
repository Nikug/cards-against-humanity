import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

export const Game = (props) => {
    const [state, setState] = useState("Not from server");

    useEffect(() => {
        const socket = socketIOClient(SOCKET_URL);
        socket.on("FromAPI", data => {
            console.log("connection to server");
            setState(data);
        });
        return () => socket.disconnect();
    }, []);

    return(
        <div>
            <p>{`Game ${props.match.params.id}`}</p>
            <p>{state}</p>
        </div>

    );
}
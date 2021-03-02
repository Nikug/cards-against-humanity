import React, { useEffect, useState } from "react";

import { socket } from "../sockets/socket";

export const SocketMessenger = (props) => {
    const defaultData = {
        gameID: props.gameID,
        playerID: props.playerID,
    };

    const [message, setMessage] = useState("");
    const [data, setData] = useState(JSON.stringify(defaultData, null, 2));

    const submit = (event) => {
        event.preventDefault();
        try {
            const socketData = JSON.parse(data);
            socket.emit(message, socketData);
        } catch (error) {
            console.error(error);
        }
    };

    // TODO: Add tab key support

    return (
        <div>
            <form onSubmit={submit}>
                <label>
                    Message:
                    <br />
                    <input
                        type="text"
                        name="message"
                        onChange={(event) => setMessage(event.target.value)}
                        value={message}
                    />
                </label>
                <br />
                <label>
                    Data:
                    <br />
                    <textarea
                        name="data"
                        rows="5"
                        cols="30"
                        onChange={(event) => setData(event.target.value)}
                        value={data}
                    ></textarea>
                </label>
                <input type="submit" value="submit" />
            </form>
        </div>
    );
};

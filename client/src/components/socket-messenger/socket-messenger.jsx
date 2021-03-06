import React, { useRef, useState } from "react";

import { socket } from "../sockets/socket";

const tabWidth = 2;

export const SocketMessenger = (props) => {
    const defaultData = {
        gameID: props.gameID,
        playerID: props.playerID,
    };

    const [message, setMessage] = useState("");
    const [data, setData] = useState(
        JSON.stringify(defaultData, null, tabWidth)
    );
    const textArea = useRef();

    const submit = (event) => {
        event.preventDefault();
        try {
            const socketData = JSON.parse(data);
            socket.emit(message, socketData);
        } catch (error) {
            console.error(error);
        }
    };

    const handleTab = (event) => {
        if (event.key === "Tab") {
            event.preventDefault();
            const {
                selectionStart: start,
                selectionEnd: end,
                value: text,
            } = event.target;
            const value =
                text.substring(0, start) +
                " ".repeat(tabWidth) +
                text.substring(end);
            textArea.current.value = value;
            const cursorPosition = start + tabWidth;
            textArea.current.setSelectionRange(cursorPosition, cursorPosition);
        }
    };

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
                        ref={textArea}
                        name="data"
                        rows="6"
                        cols="50"
                        onChange={(event) => setData(event.target.value)}
                        value={data}
                        onKeyDown={handleTab}
                    ></textarea>
                </label>
                <input type="submit" value="submit" />
            </form>
        </div>
    );
};

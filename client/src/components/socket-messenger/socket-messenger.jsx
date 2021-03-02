import React from "react";
import { socket } from "../sockets/socket";

export const socketMessenger = (props) => {
    const [message, setMessage] = useState("");
    const [data, setData] = useState("");

    const submit = () => {
        socket.emit(message, data.json());
    };

    return (
        <div>
            <form onSubmit={}>
                <label>
                    Message:
                    <input type="text" name="message" />
                </label>
                <label>
                    Data:
                    <input type="text-area" name="data" />
                </label>
                <input type="submit" value="submit" />
            </form>
        </div>
    );
};

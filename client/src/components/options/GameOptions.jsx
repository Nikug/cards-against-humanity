import React, { useState, useEffect } from "react";
import { socket } from "../sockets/socket";

export const GameOptions = (props) => {
    const [options, setOptions] = useState(props.options);

    const setMaxPlayers = (value) => {
        const maxPlayers = parseInt(value);
        if (maxPlayers) {
            const newOptions = {...options, maximumPlayers: maxPlayers }
            setOptions(newOptions);
            socket.emit("update_game_options", {...newOptions, id: props.id});
        }
    };

    useEffect(() => {
        setOptions(props.options);
    }, [props.options]);

    useEffect(() => {
        socket.on("update_game_options", (newOptions) => {
            setOptions(newOptions);
        });
    }, []);

    return (
        <div>
            <label htmlFor="maxPlayers">Pelaajien määrä: </label>
            <input
                type="number"
                id="maxPlayers"
                name="maxPlayers"
                value={options?.maximumPlayers || 3}
                min="3"
                max="50"
                onChange={(e) => setMaxPlayers(e.target.value)}
            />
            <pre>{JSON.stringify(options, null, 2)}</pre>
        </div>
    );
};

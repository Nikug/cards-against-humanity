import React, { useState, useEffect } from "react";
import { socket } from "../sockets/socket";

export const GameOptions = (props) => {
    const [options, setOptions] = useState(props.options);

    const setMaxPlayers = (value) => {
        const maxPlayers = parseInt(value);
        if (maxPlayers) {
            setOptions({ ...options, maximumPlayers: maxPlayers });
        }
    };

    useEffect(() => {}, []);

    console.log(options);

    return (
        <div>
            <label htmlFor="maxPlayers">Pelaajien määrä: </label>
            <input
                type="number"
                id="maxPlayers"
                name="maxPlayers"
                defaultValue={props.options?.maximumPlayers}
                min="3"
                max="50"
                onChange={(e) => setMaxPlayers(e.target.value)}
            />
        </div>
    );
};

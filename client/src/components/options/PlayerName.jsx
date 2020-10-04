import React, { useState } from "react";
import { socket } from "../sockets/socket";

export const PlayerName = (props) => {
    const [name, setName] = useState("");

    const setPlayerName = (e) => {
        e.preventDefault();

        const cleanedName = name.trim();

        if (!!props.playerID && cleanedName.length > 0) {
            socket.emit("set_player_name", {
                gameID: props.gameID,
                playerID: props.playerID,
                playerName: cleanedName
            });
        }
    };

    return (
        <div>
            <p>{`Player id: ${props.playerID}`}</p>
            <form onSubmit={(e) => setPlayerName(e)}>
                <label htmlFor="playerName">Valitse nimi: </label>
                <input
                    type="text"
                    id="playerName"
                    placeholder="Nimi"
                    value={name}
                    maxLength="50"
                    onChange={e => setName(e.target.value)}
                />
                <input type="submit" value="OK"/>
            </form>
        </div>
    );
};

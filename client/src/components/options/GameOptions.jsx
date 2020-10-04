import React, { useState, useEffect } from "react";
import { socket } from "../sockets/socket";

export const GameOptions = (props) => {
    const [options, setOptions] = useState(props.options);

    const setMaxPlayers = (value) => {
        const maxPlayers = parseInt(value);
        if (!!maxPlayers) {
            updateOptions("maximumPlayers", maxPlayers);
        }
    };

    const setScoreLimit = (value) => {
        const scoreLimit = parseInt(value);
        if (!!scoreLimit) {
            updateOptions("scoreLimit", scoreLimit);
        }
    };

    const setWinnerBecomesCardCzar = (value) => {
        updateOptions("winnerBecomesCardCzar", !!value);
    };

    const setKickedPlayerJoin = (value) => {
        updateOptions("allowKickedPlayerJoin", !!value);
    };

    const updateOptions = (key, value) => {
        if (value !== undefined) {
            const newOptions = { ...options, [key]: value };
            setOptions(newOptions);
            socket.emit("update_game_options", {
                options: newOptions,
                gameID: props.gameID,
            });
        }
    };

    useEffect(() => {
        setOptions(props.options);
    }, [props.options]);

    return (
        <div>
            <p>{`Am I host: ${props.isHost ? "Yes" : "No"}`}</p>
            {!!options && (
                <div>
                    <label htmlFor="maxPlayers">Pelaajien määrä: </label>
                    <input
                        type="number"
                        id="maxPlayers"
                        name="maxPlayers"
                        value={options?.maximumPlayers || 8}
                        min="3"
                        max="50"
                        onChange={(e) => setMaxPlayers(e.target.value)}
                        disabled={!props.isHost}
                    />
                    <br />
                    <label htmlFor="scoreLimit">Pisteraja: </label>
                    <input
                        type="number"
                        id="scoreLimit"
                        name="scoreLimit"
                        value={options?.scoreLimit || 5}
                        min="1"
                        max="100"
                        onChange={(e) => setScoreLimit(e.target.value)}
                        disabled={!props.isHost}
                    />
                    <br />
                    <label htmlFor="winnerBecomesCardCzar">
                        Voittajasta tulee seuraava korttikuningas:{" "}
                    </label>
                    <input
                        type="checkbox"
                        id="winnerBecomesCardCzar"
                        name="winnerBecomesCardCzar"
                        checked={options?.setWinnerBecomesCardCzar}
                        onChange={(e) =>
                            setWinnerBecomesCardCzar(e.target.checked)
                        }
                        disabled={!props.isHost}
                    />
                    <br />
                    <label htmlFor="allowKickedPlayerJoin">
                        Potkitut pelaajat saavat liittyä takaisin peliin:{" "}
                    </label>
                    <input
                        type="checkbox"
                        id="allowKickedPlayerJoin"
                        name="allowKickedPlayerJoin"
                        checked={options?.allowKickedPlayerJoin}
                        onChange={(e) => setKickedPlayerJoin(e.target.checked)}
                        disabled={!props.isHost}
                    />
                    <br />
                </div>
            )}
        </div>
    );
};

import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import axios from "axios";

export const Home = (props) => {
    const [game, setGame] = useState("");

    const startGame = () => {
        axios.post("/g")
            .then((res) => {
                setGame(res.data);
            });
    }

    return (
        game === "" ? (
            <div>
                <input
                    type="button"
                    value="Luo Peli"
                    onClick={startGame}
                />
            </div>
        ) : (
            <Redirect to={{
                pathname: `/g/${game.url}`,
                state: {...game}
            }}
            />
        )
    );
}
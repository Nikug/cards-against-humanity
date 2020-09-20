import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import axios from "axios";

export const Home = (props) => {
    const [redirect, setRedirect] = useState("");

    const startGame = () => {
        axios.post("/g")
            .then((res) => {
                setRedirect(res.data);
            });
    }

    return (
        redirect === "" ? (
            <div>
                <input
                    type="button"
                    value="Luo Peli"
                    onClick={startGame}
                />
            </div>
        ) : (
            <Redirect to={`/g/${redirect}`} />
        )
    );
}
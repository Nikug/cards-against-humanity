import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import axios from "axios";

export const Home = (props) => {
    const [url, setUrl] = useState("");

    const startGame = () => {
        axios.post("/g").then((res) => {
            console.log(res);
            setUrl(res.data.url);
        });
    };

    return url === "" ? (
        <div>
            <input type="button" value="Luo Peli" onClick={startGame} />
        </div>
    ) : (
        <Redirect
            to={{
                pathname: `/g/${url}`,
                state: url,
            }}
        />
    );
};

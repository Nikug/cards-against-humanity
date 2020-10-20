import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import axios from "axios";

export function Home(props) {
    const [url, setUrl] = useState("");

    function startNewGame() {
        axios.post("/g").then((res) => {
            setUrl(res.data.url);
        });
    };

    function joinExistingGame(gameUrl) {
        setUrl(gameUrl);
    }

    const urlIsEmpty = url === "";

    if (urlIsEmpty) { 
        return (
            <div>
                <input type="button" value="Luo Peli" onClick={startNewGame} />
                <input type="button" value="Liity Peliin" onClick={() => joinExistingGame(url)} />
            </div>
        )
    }
    
    return (
        <Redirect
            to={{
                pathname: `/g/${url}`,
                state: url,
            }}
        />
    );
};

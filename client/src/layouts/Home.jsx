import React from "react";
import { Redirect } from "react-router-dom";

export function Home(props) {
    const {url, startNewGame, joinExistingGame} = props;
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

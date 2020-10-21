import React from "react";
import { Redirect } from "react-router-dom";

import "../styles/home.scss"

export function Home(props) {
    const {url, startNewGame, joinExistingGame} = props;
    const urlIsEmpty = url === "";

    if (urlIsEmpty) { 
        return (
            <div className="home-wrapper">
                <h1 className="welcome-text">
                    Tervetuloa pelaamaan kortteja ihmiskuntaa vastaan!
                </h1>
                <div className="create-or-join-game-buttons">
                    <div className="container">
                        <div className="text">Luo uusi peli</div>
                        <button className="button" onClick={startNewGame}>Luo peli</button>
                    </div>
                    <div className="container border">
                        <div className="text">Liity olemassa olevaan peliin syöttämällä linkki</div>
                        <div className="input-and-button-container">
                            <input type="text" className="input"/> 
                            <input type="button" value="Liity" className="button primary" onClick={() => joinExistingGame(url)} />
                        </div>
                    </div>
                </div>
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

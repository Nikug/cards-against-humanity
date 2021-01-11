import React, { useState, useEffect } from "react";
import { Redirect, useHistory } from "react-router-dom";

import "../styles/home.scss";

import Button, { BUTTON_TYPES } from "../components/button";
export function Home({ url, joinExistingGame, startNewGame }) {
    const history = useHistory();
    const [newUrl, setNewUrl] = useState("");

    function handleKeyDown(event) {
        if (event.key === "Enter") {
            joinExistingGame(newUrl);
        }
    }

    function newUrlChange(event) {
        setNewUrl(event.target.value);
    }

    function joinExistingGameCallback() {
        joinExistingGame(newUrl);
    }

    function startNewGameCallback() {
        startNewGame();
    }

    useEffect(() => {
        console.log({ url });
        setNewUrl(url);
    }, [url]);

    const urlIsEmpty = url === "";

    if (urlIsEmpty) {
        return (
            <div className="home-wrapper">
                <h1 className="welcome-text">
                    Tervetuloa pelaamaan kortteja ihmiskuntaa vastaan!
                </h1>

                <div className="create-or-join-game-buttons">
                    <div className="container">
                        <div className="text">
                            Luo uusi peli, johon voit kutsua kaverisi mukaan
                        </div>
                        <div className="input-and-button-container">
                            <Button
                                text="Luo peli"
                                type={BUTTON_TYPES.PRIMARY}
                                callback={startNewGameCallback}
                                icon="add_circle_outline"
                            ></Button>
                        </div>
                    </div>
                    <div className="container border">
                        <div className="text">
                            Liity olemassa olevaan peliin syöttämällä pelin nimi
                        </div>
                        <div className="input-and-button-container">
                            <input
                                type="text"
                                className="input"
                                placeholder="existing-game-69"
                                onChange={(e) => newUrlChange(e)}
                                value={newUrl}
                                onKeyDown={(e) => handleKeyDown(e)}
                            />
                            <Button
                                text="Liity peliin"
                                type={BUTTON_TYPES.PRIMARY}
                                callback={joinExistingGameCallback}
                                callbackParams={{}}
                                icon="login"
                            ></Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Redirect
            to={{
                pathname: `/g/${url}`,
                state: url,
            }}
        />
    );
}

import { BUTTON_TYPES, Button } from "../../components/button";
import React, { useState } from "react";

import { translateCommon } from "../../helpers/translation-helpers";
import { useTranslation } from "react-i18next";
import { TextControl } from "../../components/TextControl";

export const Home = ({ joinExistingGame, startNewGame }) => {
    const { t } = useTranslation();
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

    return (
        <div className="home-wrapper">
            <h1 className="welcome-text">
                {translateCommon("welcomeToPlayCardsAgainstHumankind", t)}!
            </h1>

            <div className="create-or-join-game-buttons">
                <div className="container">
                    <div className="text">
                        {translateCommon("createNewGame", t)}
                    </div>
                    <div className="input-and-button-container">
                        <Button
                            text={translateCommon("createGame", t)}
                            type={BUTTON_TYPES.PRIMARY}
                            callback={startNewGameCallback}
                            icon="add_circle_outline"
                        ></Button>
                    </div>
                </div>
                <div className="container">
                    <div className="text">
                        {translateCommon("joinExistingGame", t)}
                    </div>
                    <div className="input-and-button-container">
                        <TextControl
                            className="input"
                            placeholder="existing-game-69"
                            onChange={newUrlChange}
                            onKeyDown={handleKeyDown}
                            value={newUrl}
                            hasConfirm={true}
                            buttonText={translateCommon("joinToGame", t)}
                            buttonOnClick={joinExistingGameCallback}
                            buttonIcon={"login"}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

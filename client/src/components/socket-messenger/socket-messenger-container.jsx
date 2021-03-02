import React, { useState } from "react";

import Button from "../button";
import { SocketMessenger } from "./socket-messenger";

export const SocketMessengerContainer = (props) => {
    const [open, setOpen] = useState(false);

    const toggleMenu = () => {
        setOpen((previous) => !previous);
    };

    return (
        <div className="menu-button-wrapper">
            <Button icon="menu" callback={toggleMenu} />
            <div className="menu-anchor">
                {open && (
                    <div className="menu-container">
                        <SocketMessenger
                            gameID={props.gameID}
                            playerID={props.playerID}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

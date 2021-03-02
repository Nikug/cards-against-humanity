import { Button } from "../button";
import React from "react";
import { SocketMessenger } from "./socket-messenger";

export const socketMessengerContainer = (props) => {
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
                        <SocketMessenger />
                    </div>
                )}
            </div>
        </div>
    );
};

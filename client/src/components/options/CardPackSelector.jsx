import React, { useState } from "react";
import { socket } from "../sockets/socket";

export const CardPackSelector = (props) => {
    const [text, setText] = useState("");

    const {gameID, playerID, isHost, cardPacks} = props;

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({gameID, text, playerID});
        socket.emit("add_card_pack", {
            gameID: gameID,
            cardPackID: text,
            playerID: playerID,
        });
        setText("");
    };

    const removeCardPack = (packID) => {
        socket.emit("remove_card_pack", {
            gameID: gameID,
            cardPackID: packID,
            playerID: playerID,
        });
    };

    return (
        <div>
            {isHost && (
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Allbad.cards id"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <input type="submit" value={"Lisää"} />
                </form>
            )}
            <h3>Korttipakat</h3>
            <div>
                {cardPacks.map((cardPack) => (
                    <div key={cardPack.id}>
                        <span>
                            <p>{`${cardPack.id} ${cardPack.name}`}</p>
                            <p>{`Mustia kortteja: ${cardPack.blackCards} Valkoisia kortteja: ${cardPack.whiteCards}`}</p>
                        </span>
                        {cardPack.isNSFW && <p>Vaarallinen töihin</p>}
                        {isHost && (
                            <button
                                value={cardPack.id}
                                onClick={(e) => {
                                    removeCardPack(e.target.value);
                                }}
                            >
                                Poista
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

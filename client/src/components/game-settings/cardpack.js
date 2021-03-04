import React from "react";

import Icon from "./../icon";

export function CardPack({
    id,
    name,
    isNSFW,
    whiteCards,
    blackCards,
    removeCardpack,
}) {
    return (
        <div className="cardpack-container">
            <div className="setting cardpack">
                <span className="name">{name}</span>
                <span className="cardcount">
                    {whiteCards} valkoista korttia
                </span>
                <span className="cardcount">{blackCards} mustaa korttia</span>
                <span className="nsfw">
                    {isNSFW ? "NSFW" : "Perheystävällinen"}
                </span>
            </div>
            <div className="remove" onClick={() => removeCardpack(id)}>
                <Icon name="delete_outline" className="md-36" />
            </div>
        </div>
    );
}

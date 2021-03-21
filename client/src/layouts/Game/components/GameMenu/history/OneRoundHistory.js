import React from "react";

export const OneRoundHistory = ({ roundNumber, cards }) => {
    return (
        <div className="one-round-history">
            <div className="title">Kierros {roundNumber}</div>
            <div className="cards-container">{cards}</div>
        </div>
    );
};

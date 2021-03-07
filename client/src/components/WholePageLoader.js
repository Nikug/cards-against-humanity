import React from "react";
import { getRandomSpinner } from "./spinner";

export const WholePageLoader = ({ text = "Ei hätää, sivua ladataan..." }) => {
    return (
        <div className="loading-page-spinner-container">
            <div className="loading-text">{text}</div>
            <div className="loading-page-spinner">{getRandomSpinner()}</div>
        </div>
    );
};

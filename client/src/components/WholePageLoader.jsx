import React from "react";
import { SpinnerCircular } from "spinners-react";
import { getRandomSpinner } from "./spinner";

export const WholePageLoader = ({ text }) => {
    return (
        <>
            <div className="loading-page-spinner-container">
                <div className="texts">
                    <div className="loading-text">
                        {text && text.fi
                            ? text.fi
                            : "Ei hätää, sivua ladataan..."}
                    </div>
                    <div className="loading-text">
                        {text && text.en
                            ? text.en
                            : "Don't worry, the page is loading..."}
                    </div>
                </div>
                <div className="loading-page-spinner">{getRandomSpinner()}</div>
            </div>
        </>
    );
};

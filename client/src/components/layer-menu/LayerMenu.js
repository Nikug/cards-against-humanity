import React from "react";

export const LayerMenu = ({ content, closeLayerMenu }) => {
    const handleClick = (event) => {
        event.stopPropagation();
    };

    return (
        <div className="layermenu" onClick={handleClick}>
            <div className="anchor">
                <span className="close-icon" onClick={closeLayerMenu}>
                    Sulje
                </span>
            </div>
            <div className="content"></div>
            {content}
        </div>
    );
};

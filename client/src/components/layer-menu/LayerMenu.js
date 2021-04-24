import React from "react";
import { translateCommon } from "../../helpers/translation-helpers";
import { useTranslation } from "react-i18next";

export const LayerMenu = ({ content, closeLayerMenu }) => {
    const { t } = useTranslation();

    const handleClick = (event) => {
        event.stopPropagation();
        event.preventDefault();
    };

    return (
        <div className="layermenu" onClick={handleClick}>
            <div className="anchor">
                <span className="close-icon" onClick={closeLayerMenu}>
                    {translateCommon("close", t)}
                </span>
            </div>
            <div className="content">{content}</div>
        </div>
    );
};

import React from "react";
import { useTranslation } from "react-i18next";
import { translateCommon } from "../../helpers/translation-helpers";

export const GameSettingsHeader = ({ keyword, plainText }) => {
    const { t } = useTranslation();

    return (
        <div className="game-settings-title">
            {plainText ?? translateCommon(keyword, t)}
        </div>
    );
};

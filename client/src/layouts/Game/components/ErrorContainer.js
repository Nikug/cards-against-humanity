import React from "react";
import { translateNotification } from "../../../helpers/translation-helpers";
import { useTranslation } from "react-i18next";

export const ErrorContainer = () => {
    const { t } = useTranslation();

    return (
        <div className="error-info">
            {translateNotification("otherError", t)}
        </div>
    );
};

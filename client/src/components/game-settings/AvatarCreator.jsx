import React from "react";
import { useTranslation } from "react-i18next";
import { translateUnderWork } from "../../helpers/translation-helpers";

export const AvatarCreator = () => {
    const { t } = useTranslation();

    return (
        <div className="avatar-creator-container">
            {translateUnderWork("avatarCreator", t)}
        </div>
    );
};

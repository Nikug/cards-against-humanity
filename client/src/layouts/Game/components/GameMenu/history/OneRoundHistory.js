import React from "react";
import { translateCommon } from "../../../../../helpers/translation-helpers";
import { useTranslation } from "react-i18next";

export const OneRoundHistory = ({ roundNumber, cards }) => {
    const { t } = useTranslation();

    return (
        <div className="one-round-history">
            <div className="title">
                {`${translateCommon("round", t)} ${roundNumber}`}
            </div>
            <div className="cards-container">{cards}</div>
        </div>
    );
};

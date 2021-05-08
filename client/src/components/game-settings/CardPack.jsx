import Icon from "../icon";
import React from "react";
import { translateCommon } from "../../helpers/translation-helpers";
import { useTranslation } from "react-i18next";

export const CardPack = ({
    blackCards,
    id,
    isNSFW,
    name,
    removeCardpack,
    whiteCards,
}) => {
    const { t } = useTranslation();

    return (
        <div className="cardpack-container">
            <div className="cardpack">
                <div className="info-wrapper">
                    <span className="name">{name}</span>
                    <span className="nsfw">
                        {isNSFW
                            ? translateCommon("NSFW", t)
                            : translateCommon("familyFriendly", t)}
                    </span>
                </div>
                <div className="info-wrapper card-amounts">
                    <span className="cardcount-white">
                        {translateCommon("whiteCard", t, { count: whiteCards })}
                    </span>
                    <span className="cardcount-black">
                        {translateCommon("blackCard", t, { count: blackCards })}
                    </span>
                </div>
            </div>
            <div className="remove" onClick={() => removeCardpack(id)}>
                <Icon name="delete_outline" />
            </div>
        </div>
    );
};

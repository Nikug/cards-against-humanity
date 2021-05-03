import Icon from "./../icon";
import React from "react";
import { translateCommon } from "../../helpers/translation-helpers";
import { useTranslation } from "react-i18next";

export const CardPack = ({
    id,
    name,
    isNSFW,
    whiteCards,
    blackCards,
    removeCardpack,
}) => {
    const { t } = useTranslation();

    return (
        <div className="cardpack-container">
            <div className="setting cardpack">
                <span className="name">{name}</span>
                <span className="cardcount">
                    {translateCommon("whiteCard", t, { count: whiteCards })}
                </span>
                <span className="cardcount">
                    {translateCommon("blackCard", t, { count: blackCards })}
                </span>
                <span className="nsfw">
                    {isNSFW
                        ? translateCommon("NSFW", t)
                        : translateCommon("familyFriendly", t)}
                </span>
            </div>
            <div className="remove" onClick={() => removeCardpack(id)}>
                <Icon name="delete_outline" className="md-36" />
            </div>
        </div>
    );
};

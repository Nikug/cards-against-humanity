import React, { Component } from "react";
import { CollabsibelSettingsSection } from "../settings/collabsiblesettingssection";

import { socket } from "../sockets/socket";

import "./../../styles/gamesettings.scss";
import "./../../styles/home.scss";

import { Setting, CONTROL_TYPES } from "./../settings/setting";
import { CardPack } from "./cardpack";

export const GameSettingsContainer = ({
    options,
    gameID,
    isHost,
    isDisabled,
    playerID,
}) => {
    const updateOptions = (key, value) => {
        if (!playerID || !gameID) return;
        if (value === undefined) return;

        const newOptions = { ...options, [key]: value };

        socket.emit("update_game_options", {
            options: newOptions,
            gameID: gameID,
            playerID: playerID,
        });
    };

    const updateTimers = ({ field, value }) => {
        console.log("updateTimers", { field, value });
        if (!playerID || !gameID) return;

        const oldValue = options.timers[field];
        let newValue =
            value === false
                ? null
                : value === "increase"
                ? oldValue + 5
                : oldValue - 5;

        switch (value) {
            case "increase":
                newValue = oldValue + 5;
                break;
            case "decrease":
                newValue = oldValue - 5;
                break;
            case false:
                newValue = null;
                break;
            case true:
                newValue = 30; // Some defaultValue, should server provide these?
                break;
            default:
                newValue = oldValue;
                break;
        }

        if (newValue !== null && (newValue < 5 || newValue > 600)) {
            return;
        }

        const newTimers = { ...options.timers, [field]: newValue };

        updateOptions("timers", newTimers);
    };

    const changeMaxPlayers = (value) => {
        const oldValue = options.maximumPlayers;
        let newValue;

        if (value === "increase") {
            newValue = oldValue + 1;
        } else {
            newValue = oldValue - 1;
        }

        if (newValue > 99) {
            return;
        }

        updateOptions("maximumPlayers", newValue);
    };

    const changeWinScore = (value) => {
        const oldValue = options.scoreLimit;
        let newValue;

        if (value === "increase") {
            newValue = oldValue + 1;
        } else {
            newValue = oldValue - 1;
        }

        if (newValue > 99) {
            return;
        }

        updateOptions("scoreLimit", newValue);
    };

    const toggleValue = (value) => {
        const oldValue = options[value];
        const newValue = !oldValue;

        updateOptions(value, newValue);
    };

    const addCardPack = (id) => {
        socket.emit("add_card_pack", {
            gameID: gameID,
            cardPackID: id,
            playerID: playerID,
        });
    };

    const removeCardpack = (id) => {
        socket.emit("remove_card_pack", {
            gameID: gameID,
            cardPackID: id,
            playerID: playerID,
        });
    };

    const renderCardPacks = (cardPacks) => {
        const renderedCardPacks = [];

        if (!cardPacks) {
            return;
        }

        cardPacks.forEach((cardPack) => {
            const { name, id, isNSFW, whiteCards, blackCards } = cardPack;

            renderedCardPacks.push(
                <CardPack
                    key={id}
                    id={id}
                    name={name}
                    isNSFW={isNSFW}
                    whiteCards={whiteCards}
                    blackCards={blackCards}
                    removeCardpack={removeCardpack}
                />
            );
        });

        return renderedCardPacks;
    };

    const iconClassnames = "md-36 icon-margin-right";
    const {
        maximumPlayers,
        selectWhiteCardTimeLimit,
        selectBlackCardTimeLimit,
        scoreLimit,
        popularVote,
        winnerBecomesCardCzar,
        allowKickedPlayerJoin,
        cardPacks,
    } = options;
    const renderedCardPacks = renderCardPacks(cardPacks);
    const {
        selectBlackCard,
        selectWhiteCards,
        readBlackCard,
        selectWinner,
        roundEnd,
    } = options.timers;

    return (
        <div
            className={`game-settings-container ${
                isDisabled ? "disabled" : ""
            }`}
        >
            <div>
                <div className="game-settings">
                    <div className="settings-block">
                        <h2 className="game-settings-title">Pelin asetukset</h2>
                        <Setting
                            text={"Pisteraja"}
                            controlType={CONTROL_TYPES.number}
                            onChangeCallback={changeWinScore}
                            currentValue={scoreLimit}
                            isDisabled={isDisabled}
                            icon={{
                                name: "emoji_events",
                                className: iconClassnames,
                                isDisabled: isDisabled,
                            }}
                        />

                        <Setting
                            text={"Pelaajien enimmäismäärä"}
                            controlType={CONTROL_TYPES.number}
                            onChangeCallback={changeMaxPlayers}
                            currentValue={maximumPlayers}
                            isDisabled={isDisabled}
                            icon={{
                                name: "groups",
                                className: iconClassnames,
                                isDisabled: isDisabled,
                            }}
                        />
                        <CollabsibelSettingsSection
                            title={{
                                titleText: "Aikarajat",
                                titleIconName: "hourglass_bottom",
                            }}
                            content={
                                <>
                                    <Setting
                                        text={"Mustan kortin valinta"}
                                        controlType={[
                                            CONTROL_TYPES.toggle,
                                            CONTROL_TYPES.number,
                                        ]}
                                        onChangeCallback={updateTimers}
                                        field={"selectBlackCard"}
                                        currentValue={selectBlackCard}
                                        isDisabled={isDisabled}
                                    />
                                    <Setting
                                        text={"Valkoisen kortin valinta"}
                                        controlType={[
                                            CONTROL_TYPES.toggle,
                                            CONTROL_TYPES.number,
                                        ]}
                                        onChangeCallback={updateTimers}
                                        field={"selectWhiteCards"}
                                        currentValue={selectWhiteCards}
                                        isDisabled={isDisabled}
                                    />
                                    <Setting
                                        text={"Kortin lukeminen"}
                                        controlType={[
                                            CONTROL_TYPES.toggle,
                                            CONTROL_TYPES.number,
                                        ]}
                                        onChangeCallback={updateTimers}
                                        field={"readBlackCard"}
                                        currentValue={readBlackCard}
                                        isDisabled={isDisabled}
                                    />
                                    <Setting
                                        text={"Voittajan valinta"}
                                        controlType={[
                                            CONTROL_TYPES.toggle,
                                            CONTROL_TYPES.number,
                                        ]}
                                        onChangeCallback={updateTimers}
                                        field={"selectWinner"}
                                        currentValue={selectWinner}
                                        isDisabled={isDisabled}
                                    />
                                    <Setting
                                        text={"Uuden kierroksen aloittaminen"}
                                        controlType={[
                                            CONTROL_TYPES.toggle,
                                            CONTROL_TYPES.number,
                                        ]}
                                        onChangeCallback={updateTimers}
                                        field={"roundEnd"}
                                        currentValue={roundEnd}
                                        isDisabled={isDisabled}
                                    />
                                </>
                            }
                        />
                        <Setting
                            text={"Yleisöäänet käytössä"}
                            controlType={CONTROL_TYPES.toggle}
                            onChangeCallback={() => toggleValue("popularVote")}
                            currentValue={popularVote ? popularVote : false}
                            isDisabled={isDisabled}
                            icon={{
                                name: "thumb_up",
                                className: iconClassnames,
                                isDisabled: isDisabled,
                            }}
                        />
                        <Setting
                            text={"Voittajasta tulee seuraava korttikuningas"}
                            controlType={CONTROL_TYPES.toggle}
                            onChangeCallback={() =>
                                toggleValue("winnerBecomesCardCzar")
                            }
                            currentValue={winnerBecomesCardCzar}
                            isDisabled={isDisabled}
                            icon={{
                                name: "low_priority",
                                className: iconClassnames,
                                isDisabled: isDisabled,
                            }}
                        />
                        <Setting
                            text={
                                "Potkitut pelaajat voivat liittyä takaisin peliin"
                            }
                            controlType={CONTROL_TYPES.toggle}
                            onChangeCallback={() =>
                                toggleValue("allowKickedPlayerJoin")
                            }
                            currentValue={allowKickedPlayerJoin}
                            isDisabled={isDisabled}
                            icon={{
                                name: "remove_circle_outline",
                                className: iconClassnames,
                                isDisabled: isDisabled,
                            }}
                        />
                    </div>
                    <div className="settings-block divider">
                        <h2 className="game-settings-title">Korttipakat</h2>
                        <Setting
                            DEV_CARD_PACK_AUTOFILL={true}
                            text={"Lisää korttipakka"}
                            placeholderText={"rAnD0MchArs"}
                            controlType={CONTROL_TYPES.textWithConfirm}
                            onChangeCallback={addCardPack}
                            customControl={"custom control"}
                            icon={{
                                name: "library_add",
                                className: iconClassnames,
                                isDisabled: isDisabled,
                            }}
                        />
                        <div className="imported-card-packs">
                            Lisätyt korttipakat
                            {renderedCardPacks}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

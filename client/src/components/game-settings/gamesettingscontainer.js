import { CONTROL_TYPES, Setting } from "./../settings/setting";

import { CardPack } from "./cardpack";
import { CollabsibelSettingsSection } from "../settings/collabsiblesettingssection";
import React from "react";
import { socket } from "../sockets/socket";
import { translateCommon } from "../../helpers/translation-helpers";
import { useTranslation } from "react-i18next";

export const GameSettingsContainer = ({
    options,
    gameID,
    isDisabled,
    playerID,
}) => {
    const { t } = useTranslation();
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
        if (!playerID || !gameID) return;

        const oldValue = options.timers[field];
        let newValue;

        switch (value) {
            case "increase":
                newValue = oldValue + 5;
                break;
            case "decrease":
                newValue = oldValue - 5;
                break;
            default:
                newValue = value;
                break;
        }

        if (Number.isInteger(newValue) && (newValue < 5 || newValue > 600)) {
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

    const changeWinCondition = ({ field, value }) => {
        const oldValue = options.winConditions[field];
        let newValue;

        switch (value) {
            case "increase":
                newValue = oldValue + 1;
                break;
            case "decrease":
                newValue = oldValue - 1;
                break;
            default:
                newValue = value;
                break;
        }

        if (Number.isInteger(newValue) && newValue < 1) {
            return;
        }

        const newValues = { ...options.winConditions, [field]: newValue };

        updateOptions("winConditions", newValues);
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
        winConditions,
        popularVote,
        winnerBecomesCardCzar,
        allowKickedPlayerJoin,
        cardPacks,
    } = options;
    const renderedCardPacks = renderCardPacks(cardPacks);
    const {
        useSelectBlackCard,
        selectBlackCard,
        useSelectWhiteCards,
        selectWhiteCards,
        useReadBlackCard,
        readBlackCard,
        useSelectWinner,
        selectWinner,
        useRoundEnd,
        roundEnd,
    } = options.timers;
    const {
        scoreLimit,
        useScoreLimit,
        roundLimit,
        useRoundLimit,
    } = options.winConditions;

    return (
        <div
            className={`game-settings-container ${
                isDisabled ? "disabled" : ""
            }`}
        >
            <div>
                <div className="game-settings">
                    <div className="settings-block">
                        <h2 className="game-settings-title">
                            {translateCommon("gameSettings", t)}
                        </h2>
                        <CollabsibelSettingsSection
                            isDisabled={isDisabled}
                            title={{
                                titleText: translateCommon("winCondition", t),
                                titleIconName: "emoji_events",
                            }}
                            content={
                                <>
                                    <Setting
                                        text={translateCommon("scoreLimit", t)}
                                        controlType={[
                                            CONTROL_TYPES.toggle,
                                            CONTROL_TYPES.number,
                                        ]}
                                        onChangeCallback={changeWinCondition}
                                        field={["useScoreLimit", "scoreLimit"]}
                                        currentValue={[
                                            useScoreLimit,
                                            scoreLimit,
                                        ]}
                                        isDisabled={isDisabled}
                                    />
                                    <Setting
                                        text={translateCommon("roundLimit", t)}
                                        controlType={[
                                            CONTROL_TYPES.toggle,
                                            CONTROL_TYPES.number,
                                        ]}
                                        onChangeCallback={changeWinCondition}
                                        field={["useRoundLimit", "roundLimit"]}
                                        currentValue={[
                                            useRoundLimit,
                                            roundLimit,
                                        ]}
                                        isDisabled={isDisabled}
                                    />
                                </>
                            }
                        />

                        <Setting
                            text={translateCommon("playerLimit", t)}
                            controlType={[CONTROL_TYPES.number]}
                            onChangeCallback={changeMaxPlayers}
                            currentValue={[maximumPlayers]}
                            isDisabled={isDisabled}
                            icon={{
                                name: "groups",
                                className: iconClassnames,
                                isDisabled: isDisabled,
                            }}
                        />
                        <CollabsibelSettingsSection
                            isDisabled={isDisabled}
                            title={{
                                titleText: translateCommon("timers", t),
                                titleIconName: "hourglass_bottom",
                            }}
                            content={
                                <>
                                    <Setting
                                        text={translateCommon(
                                            "choosingBlackCard",
                                            t
                                        )}
                                        controlType={[
                                            CONTROL_TYPES.toggle,
                                            CONTROL_TYPES.number,
                                        ]}
                                        onChangeCallback={updateTimers}
                                        field={[
                                            "useSelectBlackCard",
                                            "selectBlackCard",
                                        ]}
                                        currentValue={[
                                            useSelectBlackCard,
                                            selectBlackCard,
                                        ]}
                                        isDisabled={isDisabled}
                                    />
                                    <Setting
                                        text={translateCommon(
                                            "choosingWhiteCard",
                                            t
                                        )}
                                        controlType={[
                                            CONTROL_TYPES.toggle,
                                            CONTROL_TYPES.number,
                                        ]}
                                        onChangeCallback={updateTimers}
                                        field={[
                                            "useSelectWhiteCards",
                                            "selectWhiteCards",
                                        ]}
                                        currentValue={[
                                            useSelectWhiteCards,
                                            selectWhiteCards,
                                        ]}
                                        isDisabled={isDisabled}
                                    />
                                    <Setting
                                        text={translateCommon("readingCard", t)}
                                        controlType={[
                                            CONTROL_TYPES.toggle,
                                            CONTROL_TYPES.number,
                                        ]}
                                        onChangeCallback={updateTimers}
                                        field={[
                                            "useReadBlackCard",
                                            "readBlackCard",
                                        ]}
                                        currentValue={[
                                            useReadBlackCard,
                                            readBlackCard,
                                        ]}
                                        isDisabled={isDisabled}
                                    />
                                    <Setting
                                        text={translateCommon(
                                            "choosingWinner",
                                            t
                                        )}
                                        controlType={[
                                            CONTROL_TYPES.toggle,
                                            CONTROL_TYPES.number,
                                        ]}
                                        onChangeCallback={updateTimers}
                                        field={[
                                            "useSelectWinner",
                                            "selectWinner",
                                        ]}
                                        currentValue={[
                                            useSelectWinner,
                                            selectWinner,
                                        ]}
                                        isDisabled={isDisabled}
                                    />
                                    <Setting
                                        text={translateCommon(
                                            "startingNextRound",
                                            t
                                        )}
                                        controlType={[
                                            CONTROL_TYPES.toggle,
                                            CONTROL_TYPES.number,
                                        ]}
                                        onChangeCallback={updateTimers}
                                        field={["useRoundEnd", "roundEnd"]}
                                        currentValue={[useRoundEnd, roundEnd]}
                                        isDisabled={isDisabled}
                                    />
                                </>
                            }
                        />
                        <Setting
                            text={translateCommon("popularVoteInUse", t)}
                            controlType={[CONTROL_TYPES.toggle]}
                            onChangeCallback={() => toggleValue("popularVote")}
                            currentValue={[popularVote ? popularVote : false]}
                            isDisabled={isDisabled}
                            icon={{
                                name: "thumb_up",
                                className: iconClassnames,
                                isDisabled: isDisabled,
                            }}
                        />
                        <Setting
                            text={translateCommon(
                                "winnerBecomesNextCardCzar",
                                t
                            )}
                            controlType={[CONTROL_TYPES.toggle]}
                            onChangeCallback={() =>
                                toggleValue("winnerBecomesCardCzar")
                            }
                            currentValue={[winnerBecomesCardCzar]}
                            isDisabled={isDisabled}
                            icon={{
                                name: "low_priority",
                                className: iconClassnames,
                                isDisabled: isDisabled,
                            }}
                        />
                        <Setting
                            text={translateCommon(
                                "kickedPlayersCanJoinBack",
                                t
                            )}
                            controlType={[CONTROL_TYPES.toggle]}
                            onChangeCallback={() =>
                                toggleValue("allowKickedPlayerJoin")
                            }
                            currentValue={[allowKickedPlayerJoin]}
                            isDisabled={isDisabled}
                            icon={{
                                name: "remove_circle_outline",
                                className: iconClassnames,
                                isDisabled: isDisabled,
                            }}
                        />
                    </div>
                    <div className="settings-block divider">
                        <h2 className="game-settings-title">
                            {translateCommon("cardDecks", t)}
                        </h2>
                        <Setting
                            DEV_CARD_PACK_AUTOFILL={true}
                            text={translateCommon("addCardDeck", t)}
                            placeholderText={"rAnD0MchArs"}
                            controlType={[CONTROL_TYPES.textWithConfirm]}
                            onChangeCallback={addCardPack}
                            customControl={"custom control"}
                            icon={{
                                name: "library_add",
                                className: iconClassnames,
                                isDisabled: isDisabled,
                            }}
                        />
                        <div className="imported-card-packs">
                            {translateCommon("addedCardDecks", t)}
                            {renderedCardPacks}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

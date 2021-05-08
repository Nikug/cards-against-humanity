import React, { useCallback, useState } from "react";

import { ActionButtonRow } from "../../layouts/Game/components/GameMenu/ActionButtonRow";
import Icon from "../icon";
import { PopOverMenu } from "../popover-menu/PopoverMenu";
import { animated } from "react-spring";
import crownIcon from "./../../assets/svgicons/crown-svgrepo-com.svg";
import { isPlayerHost } from "../../helpers/player-helpers";
import { socket } from "./../sockets/socket";
import { translateCommon } from "../../helpers/translation-helpers";
import { useGameContext } from "../../contexts/GameContext";
import { useTransition } from "react-spring";
import { useTranslation } from "react-i18next";

export const Player = ({
    name,
    state,
    score,
    isCardCzar,
    isHost,
    isPopularVoteKing,
    isSelf,
    publicID,
}) => {
    const { t } = useTranslation();

    const { player, game } = useGameContext();
    const noName = name === null || name === undefined;
    const [showTitle, setShowTitle] = useState(false);
    const [menuIsOpen, setMenuIsOpen] = useState(false);

    const toggleMenu = () => {
        if (isPlayerHost(player)) {
            setMenuIsOpen(!menuIsOpen);
        }
    };

    const nameRef = useCallback(
        (node) => {
            if (node !== null) {
                const playerNameElement = node;

                if (playerNameElement) {
                    const { clientWidth, scrollWidth } = playerNameElement;
                    if (
                        !showTitle &&
                        playerNameElement &&
                        clientWidth < scrollWidth
                    ) {
                        setShowTitle(true);
                    } else if (showTitle && !(clientWidth < scrollWidth)) {
                        setShowTitle(false);
                    }
                }
            }
            return node;
        },
        [name]
    );

    // Score animation
    const scoreTransitions = useTransition(score, null, {
        initial: {
            transform: "translate3d(0,0px,0)",
            opacity: 1,
            height: "auto",
            width: "auto",
        },
        from: {
            position: "relative",
            transform: "translate3d(0,-20px,0)",
            opacity: 0,
            height: 0,
            width: 0,
        },
        enter: {
            transform: "translate3d(0,0px,0)",
            opacity: 1,
            height: "auto",
            width: "auto",
        },
        leave: {
            opacity: 0,
            height: 0,
            width: 0,
        },
    });

    const removePlayer = (removeFromGame = true) => {
        socket.emit("kick_player", {
            gameID: game?.id,
            playerID: player?.id,
            targetID: publicID,
            removeFromGame: removeFromGame,
        });
    };

    const makePlayerSpectator = () => {
        removePlayer(false);
    };

    return (
        <div
            title={showTitle ? name : undefined}
            className={`player ${isCardCzar ? "cardCzar" : ""}`}
            onClick={toggleMenu}
        >
            {isCardCzar && (
                <div className="icon-anchor">
                    <img className="crown-icon" src={crownIcon} />
                </div>
            )}
            <span
                className={`player-name-and-status  ${
                    isHost && false ? "host" : ""
                }  ${isSelf ? "myself" : ""}`}
            >
                {state === "playing" && (
                    <Icon
                        name={"watch_later"}
                        className={`player-status clock status-${state}
                    `}
                    />
                )}
                {(state === "disconnected" || state === "kicked") && (
                    <Icon
                        name={"error_outline"}
                        className={`player-status clock status-${state}
                    `}
                    />
                )}
                {isHost && (
                    <Icon name={"home"} className={`player-status white`} />
                )}
                <span
                    ref={nameRef}
                    className={`player-name ${noName ? "no-name" : ""}`}
                >
                    {name}
                    {noName && (
                        <i
                            className="fa fa-spinner fa-spin"
                            style={{ fontSize: "24px" }}
                        />
                    )}
                </span>
            </span>
            <span className="🦄">
                <span className="player-score">
                    <Icon name="emoji_events" className="win-icon" />
                    {scoreTransitions.map(({ item, props, key }) => (
                        <animated.div className="score" key={key} style={props}>
                            {item}
                        </animated.div>
                    ))}
                </span>
                {isPopularVoteKing && (
                    <span className="player-popularVoteScore">
                        <Icon
                            name="thumb_up_alt"
                            className="popular-vote-icon"
                        />
                    </span>
                )}
            </span>
            {isPlayerHost(player) && (
                <PopOverMenu
                    isDefaultOpen={menuIsOpen}
                    noControl={true}
                    content={
                        <>
                            {name}
                            <ActionButtonRow
                                buttons={[
                                    {
                                        icon: "logout",
                                        text: translateCommon(
                                            "removeFromGame",
                                            t
                                        ),
                                        callback: removePlayer,
                                    },
                                    {
                                        icon: "groups",
                                        text: translateCommon(
                                            "moveToAudience",
                                            t
                                        ),
                                        callback: makePlayerSpectator,
                                    },
                                ]}
                            />
                        </>
                    }
                />
            )}
        </div>
    );
};

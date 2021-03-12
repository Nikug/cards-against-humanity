import React, { useState, useCallback } from "react";
import { useTransition } from "react-spring";
import { animated } from "react-spring";
import Icon from "../icon";
import { PopOverMenu } from "../popover-menu/PopoverMenu";
import crownIcon from "./../../assets/svgicons/crown-svgrepo-com.svg";
import { ActionButtonRow } from "../../layouts/Game/components/GameMenu/ActionButtonRow";
import { emptyFn } from "../../helpers/generalhelpers";
import { useGameContext } from "../../contexts/GameContext";
import { isPlayerHost } from "../../helpers/player-helpers";
import { socket } from "./../sockets/socket";

/*
interface Player {
    id: string;
    socket: string;
    name: string;
    state: PlayerState;
    score: number;
    isCardCzar: boolean;
    isHost: boolean;
    popularVoteScore: number;
    whiteCards: WhiteCard[];
}
*/

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
                        className={`player-status clock md-18 status-${state}
                    `}
                    />
                )}
                {(state === "disconnected" || state === "kicked") && (
                    <Icon
                        name={"error_outline"}
                        className={`player-status clock md-18 status-${state}
                    `}
                    />
                )}
                {isHost && (
                    <Icon
                        name={"home"}
                        className={`player-status md-18 white`}
                    />
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
            <span className="player-scores">
                <span className="player-score">
                    <Icon name="emoji_events" className="win-icon" />
                    {scoreTransitions.map(({ item, props, key }) => (
                        <animated.div key={key} style={props}>
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
                        <ActionButtonRow
                            buttons={[
                                {
                                    icon: "logout",
                                    text: "Poista pelistä",
                                    callback: removePlayer,
                                },
                                {
                                    icon: "groups",
                                    text: "Siirrä katsomoon",
                                    callback: makePlayerSpectator,
                                },
                            ]}
                        />
                    }
                />
            )}
        </div>
    );
};

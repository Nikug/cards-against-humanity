import React, { useRef, useState, useEffect, useCallback } from "react";
import { isNullOrUndefined } from "../../helpers/generalhelpers";
import Icon from "../icon";
import crownIcon from "./../../assets/svgicons/crown-svgrepo-com.svg";

import "./../../styles/playerswidget.scss";
import "./../../styles/tooltip.scss";

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
}) => {
    const noName = name === null || name === undefined;
    const [showTitle, setShowTitle] = useState(false);
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

    return (
        <div
            title={showTitle ? name : undefined}
            className={`player ${isCardCzar ? "cardCzar" : ""}`}
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
                {false && isCardCzar && (
                    <Icon
                        name={"star"}
                        className={`player-status md-18 white`}
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
                    {score}
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
        </div>
    );
};

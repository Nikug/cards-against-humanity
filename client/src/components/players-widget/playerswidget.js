import "./../../styles/playerswidget.scss";

import { animated, useTransition } from "react-spring";

import Icon from "../icon";
import { PLAYER_STATES } from "../../consts/playerstates";
import { Player } from "./player";
import React from "react";
import { Spinner } from "../spinner";
import { isNullOrUndefined } from "../../helpers/generalhelpers";
import { translateCommon } from "../../helpers/translation-helpers";
import { useTranslation } from "react-i18next";

export const PlayersWidget = ({ game, player }) => {
    const { t } = useTranslation();

    let otherContent = null;

    const renderPlayers = (players, self) => {
        const renderedPlayers = [];
        const ownId = self?.id;

        for (let i = 0, len = players.length; i < len; i++) {
            const player = players[i];
            const {
                id,
                isCardCzar,
                isHost,
                isPopularVoteKing,
                name,
                publicID,
                score,
                state,
            } = player;

            renderedPlayers.push(
                <Player
                    isCardCzar={isCardCzar}
                    isHost={isHost}
                    isPopularVoteKing={isPopularVoteKing}
                    isSelf={!isNullOrUndefined(ownId) && id === ownId}
                    key={publicID}
                    name={state === PLAYER_STATES.PICKING_NAME ? null : name}
                    player={player}
                    publicID={publicID}
                    score={score}
                    state={state}
                />
            );
        }

        return renderedPlayers;
    };

    // Player animation

    let playersToRender = game?.players || [];

    if (playersToRender.length === undefined) {
        otherContent = (
            <div className="players-widget loading">
                <Spinner />
            </div>
        );
    }

    playersToRender = playersToRender.filter((player) => {
        return player.state !== "spectating";
    });

    if (playersToRender.length === 0) {
        otherContent = (
            <div className="players-widget no-active-players">
                <Icon name="sentiment_dissatisfied" />
                <div>{translateCommon("noActivePlayers", t)}</div>
            </div>
        );
    }

    const renderedPlayers = renderPlayers(playersToRender, player);

    const playerTransitions = useTransition(
        renderedPlayers,
        (player) => player.key,
        {
            initial: {
                opacity: 1,
            },
            from: {
                opacity: 0,
            },
            enter: {
                opacity: 1,
            },
            leave: {
                opacity: 0,
            },
            unique: true,
        }
    );

    return otherContent ? (
        otherContent
    ) : (
        <div className="players-widget">
            {playerTransitions.map(({ item, props, key }) => (
                <animated.div key={key} style={props}>
                    {item}
                </animated.div>
            ))}
        </div>
    );
};

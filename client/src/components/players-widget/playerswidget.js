import "./../../styles/playerswidget.scss";

import React from "react";

import { PLAYER_STATES } from "../../consts/playerstates";
import { Player } from "./player";
import { isNullOrUndefined } from "../../helpers/generalhelpers";
import { Spinner } from "../spinner";
import { animated, useTransition } from "react-spring";
import Icon from "../icon";

export const PlayersWidget = ({ game, player }) => {
    let otherContent = null;

    const renderPlayers = (players, self) => {
        const renderedPlayers = [];
        const ownId = self?.id;

        for (let i = 0, len = players.length; i < len; i++) {
            const player = players[i];
            const {
                id,
                name,
                state,
                score,
                isCardCzar,
                isHost,
                isPopularVoteKing,
                publicID,
            } = player;

            renderedPlayers.push(
                <Player
                    player={player}
                    key={publicID}
                    publicID={publicID}
                    name={state === PLAYER_STATES.PICKING_NAME ? null : name}
                    state={state}
                    score={score}
                    isCardCzar={isCardCzar}
                    isHost={isHost}
                    isPopularVoteKing={isPopularVoteKing}
                    isSelf={!isNullOrUndefined(ownId) && id === ownId}
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
                <div>Ei yhtään aktiivista pelaajaa</div>
            </div>
        );
    }

    const renderedPlayers = [
        ...renderPlayers(playersToRender, player),
        ...renderPlayers(playersToRender, player),
        ...renderPlayers(playersToRender, player),
        ...renderPlayers(playersToRender, player),
    ];

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

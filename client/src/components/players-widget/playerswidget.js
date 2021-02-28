import "./../../styles/playerswidget.scss";

import React, { Component, createRef } from "react";

import { PLAYER_STATES } from "../../consts/playerstates";
import { Player } from "./player";
import { getPlayersList } from "../../fakedata/fakeplayerdata";
import { isNullOrUndefined } from "../../helpers/generalhelpers";

export class PlayersWidget extends Component {
    renderPlayers(players, self) {
        const renderedPlayers = [];
        const game = this.props.game;
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
            } = player;

            renderedPlayers.push(
                <Player
                    key={i}
                    id={id}
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
    }

    render() {
        const { game, player } = this.props;
        let playersToRender = game?.players || [];

        if (playersToRender.length === 0 && player) {
            playersToRender.unshift(player);
        }

        playersToRender = playersToRender.filter((player) => {
            return player.state !== "spectating";
        });

        const renderedPlayers = this.renderPlayers(playersToRender, player);

        return <div className="players-widget">{renderedPlayers}</div>;
    }
}

import "./../../styles/playerswidget.scss";

import React, { Component, createRef } from "react";

import { PLAYER_STATES } from "../../consts/playerstates";
import { Player } from "./player";
import { getPlayersList } from "../../fakedata/fakeplayerdata";
import { isNullOrUndefined } from "../../helpers/generalhelpers";
import { Spinner } from "../spinner";
import Icon from "../icon";

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

        if (playersToRender.length === undefined) {
            return (
                <div className="players-widget loading">
                    <Spinner />
                </div>
            );
        }

        playersToRender = playersToRender.filter((player) => {
            return player.state !== "spectating";
        });

        if (playersToRender.length === 0) {
            return (
                <div className="players-widget no-active-players">
                    <Icon name="sentiment_dissatisfied" />
                    <div>Ei yhtään aktiivista pelaajaa</div>
                </div>
            );
        }

        const renderedPlayers = this.renderPlayers(playersToRender, player);

        return <div className="players-widget">{renderedPlayers}</div>;
    }
}

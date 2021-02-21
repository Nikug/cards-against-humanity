import React, { Component } from "react";
import { PLAYER_STATES } from "../../consts/playerstates";
import { getPlayersList } from "../../fakedata/fakeplayerdata";
import { isNullOrUndefined } from "../../helpers/generalhelpers";

import "./../../styles/playerswidget.scss";

import { Player } from "./player";

export class PlayersWidget extends Component {
    renderPlayers(players, self) {
        const renderedPlayers = [];
        const game = this.props.game;
        const ownName = self?.name;

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

            console.log("debug 123", { name, ownName });

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
                    isSelf={
                        !isNullOrUndefined(ownName) &&
                        state !== "pickingName" &&
                        name === ownName
                    }
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

        const renderedPlayers = this.renderPlayers(playersToRender, player);

        return <div className="players-widget">{renderedPlayers}</div>;
    }
}

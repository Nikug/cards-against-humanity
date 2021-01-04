import React, {Component} from 'react'
import { GAME_STATES } from '../../consts/gamestates';
import { PLAYER_STATES } from '../../consts/playerstates';

import "./../../styles/playerswidget.scss"

import {Player} from "./player";

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

export class PlayersWidget extends Component {
    renderPlayers(players) {
        const renderedPlayers = [];

        for(let i = 0, len = players.length; i < len; i++) {
            const player = players[i];
            console.log({player})
            const {id, name, state, score, popularVoteScore, isCardCzar} = player;

            renderedPlayers.push(
                <Player
                    key={id}
                    name={state === PLAYER_STATES.PICKING_NAME ? null : name}
                    state={state}
                    score={score}
                    popularVoteScore={popularVoteScore}
                    isCardCzar={isCardCzar}
                />
            )
        }

        return renderedPlayers;
    }

    render() {
        const { game, player } = this.props;
        let playersToRender = game?.players || [];

        if (playersToRender.length === 0 && player) {
            playersToRender.unshift(player);
        }

        const renderedPlayers = this.renderPlayers(playersToRender);

        console.log({playersToRender, player, renderedPlayers});
        return (
            <div className="players-widget">
                {renderedPlayers}
            </div>
        )
    }
}

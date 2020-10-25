import React, {Component} from 'react'

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
    constructor(props) {
        super(props);

        this.state = {
            self: {},
            players: [],
            gameState: null,
            timer: null
        };
    }

    render() {
        const { self, players, gameState, timer } = this.state;
        const playersToRender = players.unshift(self);

        return (
            <div className="players-widget">
                <Player name="player 1" state="waiting" score={3} popularVoteScore={5}/>
                <Player name="player 2" state="ready" score={0} popularVoteScore={3}/>
                <Player name="player 3" state="waiting" score={2} popularVoteScore={8}/>
                <Player name="player 4" state="waiting" score={6} popularVoteScore={13}/>
                <Player name="player 5" state="error" score={1} popularVoteScore={100}/>
            </div>
        )
    }
}

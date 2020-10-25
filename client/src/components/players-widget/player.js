import React, {Component} from 'react'
import Icon from '../icon';

import "./../../styles/playerswidget.scss"

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

export class Player extends Component {
    render() {
        const { id, socket, name, state, score, isCardCzar, isHost, popularVoteScore, whiteCards } = this.props;

        return (
            <div className="player">
                <span className="player-name-and-status">
                    <Icon name="fiber_manual_record" className={`status-${state}`}/>
                    <span className="player-name">{name}</span>
                </span>
                <span className="player-scores">
                    <span className="player-score">
                        <Icon name="emoji_events" className="win-icon"/>
                        {score}
                    </span>
                    <span className="player-popularVoteScore">
                        <Icon name="thumb_up" className="popular-vote-icon"/>
                        {popularVoteScore}
                    </span>
                </span>
            </div>
        )
    }
}

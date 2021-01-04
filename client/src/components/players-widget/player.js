import React, {Component} from 'react';
import Icon from '../icon';

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

export class Player extends Component {
    render() {
        const { id, socket, name, state, score, isCardCzar, isHost, popularVoteScore, whiteCards } = this.props;
        const noName = name === null || name === undefined;

        return (
            <div className="player">
                <span className="player-name-and-status">
                    <Icon name={isCardCzar? "star" : "radio_button_unchecked"} className={`player-status md-18 status-${state} ${isCardCzar ? 'icon-with-border' : ''}`}/>
                    <span className={`player-name ${noName ? 'no-name' : ''}`}>{noName ? 'valitsee nimimerkkiä' : name}</span>
                </span>
                <span className="player-scores">
                    <span className="player-score">
                        <Icon name="emoji_events" className="win-icon"/>
                        {score}
                    </span>
                    <span className="player-popularVoteScore">
                        <Icon name="thumb_up_alt" className="popular-vote-icon"/>
                        {popularVoteScore}
                    </span>
                </span>
            </div>
        )
    }
}
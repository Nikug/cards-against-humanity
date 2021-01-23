import React, { Component } from 'react';
import { isNullOrUndefined } from '../../helpers/generalhelpers';
import Icon from '../icon';

import './../../styles/playerswidget.scss';
import './../../styles/tooltip.scss';

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
        const { name, state, score, isCardCzar, isHost, isPopularVoteKing } = this.props;
        const noName = name === null || name === undefined;

        return (
            <div className='player'>
                <span className={`player-name-and-status  ${isHost && false ? 'host' : ''}`}>
                    <Icon
                        name={isCardCzar ? 'radio_button_checked' : 'radio_button_unchecked'}
                        className={`player-status md-18 status-${state}
                        }`}
                    />
                    <span className={`player-name ${noName ? 'no-name' : ''}`}>
                        {`${noName ? 'valitsee nimimerkkiä' : name}${isHost ? ' (isäntä)' : ''}`}
                        {noName && <i className='fa fa-spinner fa-spin' style={{ fontSize: '24px' }} />}
                    </span>
                </span>
                <span className='player-scores'>
                    <span className='player-score'>
                        <Icon name='emoji_events' className='win-icon' />
                        {score}
                    </span>
                    {isPopularVoteKing && (
                        <span className='player-popularVoteScore'>
                            <Icon name='thumb_up_alt' className='popular-vote-icon' />
                        </span>
                    )}
                </span>
            </div>
        );
    }
}

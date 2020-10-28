import React, {Component} from 'react';
import './../../styles/gamesettings.scss'

import {Setting, CONTROL_TYPES} from './../settings/setting';

export class GameSettingsContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            maxPlayers: 8,
            roundTime: 30,
            winScore: 4,
            popularVote: true,
            winnerIsNextCardCzar: false,
            kickedPlayersCantRejoin: true
        }

        this.changeMaxPlayers = this.changeMaxPlayers.bind(this);
        this.changeWinScore = this.changeWinScore.bind(this);
        this.changeRoundTime = this.changeRoundTime.bind(this);
    }

    changeMaxPlayers(increase) {
        const oldValue = this.state.maxPlayers;
        let newValue;

        if (increase) {
            newValue= oldValue + 1;
        } else {
            newValue= oldValue - 1;
        }

        this.setState({maxPlayers: newValue})
    }

    changeWinScore(increase) {
        const oldValue = this.state.winScore;
        let newValue;

        if (increase) {
            newValue= oldValue + 1;
        } else {
            newValue= oldValue - 1;
        }

        this.setState({winScore: newValue})
    }

    changeRoundTime(increase) {
        const oldValue = this.state.roundTime;
        let newValue;

        if (increase) {
            newValue= oldValue + 5;
        } else {
            newValue= oldValue - 5;
        }

        this.setState({roundTime: newValue})
    }

    render() {
        const {isDisabled} = this.props;
        const iconClassnames = 'md-36 icon-margin-right';
        const {maxPlayers, roundTime, winScore, popularVote, winnerIsNextCardCzar, kickedPlayersCantRejoin} = this.state;

        return (
            <div className={`game-settings-container ${isDisabled ? 'disabled' : ''}`}>
                <div>
                    <div className="game-settings">
                        <div className="settings-block">
                            <h2 className="game-settings-title">
                                Pelin asetukset
                            </h2>
                            <Setting 
                                text={'Pelaajien enimmäismäärä'} 
                                controlType={CONTROL_TYPES.number}
                                onChangeCallback={this.changeMaxPlayers}
                                currentValue={maxPlayers}
                                isDisabled={false}
                                icon={{
                                    name: 'groups',
                                    className: iconClassnames,
                                    isDisabled: false
                                }}
                            />
                            <Setting 
                                text={'Kortin valinnan aikaraja'} 
                                controlType={CONTROL_TYPES.number}
                                onChangeCallback={this.changeRoundTime}
                                currentValue={roundTime}
                                isDisabled={false}
                                icon={{
                                    name: 'hourglass_bottom',
                                    className: iconClassnames,
                                    isDisabled: false
                                }}
                            />
                            <Setting 
                                text={'Pisteraja'} 
                                controlType={CONTROL_TYPES.number}
                                onChangeCallback={this.changeWinScore}
                                currentValue={winScore}
                                isDisabled={false}
                                icon={{
                                    name: 'emoji_events',
                                    className: iconClassnames,
                                    isDisabled: false
                                }}
                            />
                            <Setting 
                                text={'Yleisöäänet käytössä'} 
                                controlType={CONTROL_TYPES.toggle}
                                onChangeCallback={() => console.log('clicked')}
                                currentValue={popularVote}
                                isDisabled={false}
                                icon={{
                                    name: 'thumb_up',
                                    className: iconClassnames,
                                    isDisabled: false
                                }}
                            />
                            <Setting 
                                text={'Kierroksen voittajasta tulee seuraava korttikuningas'} 
                                controlType={CONTROL_TYPES.toggle}
                                onChangeCallback={() => console.log('clicked')}
                                currentValue={winnerIsNextCardCzar}
                                isDisabled={false}
                                icon={{
                                    name: 'low_priority',
                                    className: iconClassnames,
                                    isDisabled: false
                                }}
                            />
                            <Setting 
                                text={'Potkitut pelaajat eivät voi liittyä takaisin peliin'} 
                                controlType={CONTROL_TYPES.toggle}
                                onChangeCallback={() => console.log('clicked')}
                                currentValue={kickedPlayersCantRejoin}
                                isDisabled={false}
                                icon={{
                                    name: 'remove_circle_outline',
                                    className: iconClassnames,
                                    isDisabled: false
                                }}
                            />
                        </div>
                        <div className="settings-block divider">
                            <h2 className="game-settings-title">
                                Korttipakat
                            </h2>
                            <Setting 
                                text={'Lisää korttipakka'} 
                                controlType={CONTROL_TYPES.custom}
                                customControl={'custom control'}
                                icon={{
                                    name: 'library_add',
                                    className: iconClassnames,
                                    isDisabled: false
                                }}
                            />
                            <div className="imported-card-packs">
                                korttipakat:
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

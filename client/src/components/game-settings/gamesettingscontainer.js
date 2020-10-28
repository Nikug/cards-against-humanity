import React, {Component} from 'react';
import './../../styles/gamesettings.scss'

import {Setting, CONTROL_TYPES} from './../settings/setting';

export class GameSettingsContainer extends Component {
    render() {
        const {isDisabled} = this.props;
        const iconClassnames = 'md-36 icon-margin-right';
    

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
                                currentValue={8}
                                icon={{
                                    name: 'groups',
                                    className: iconClassnames
                                }}
                            />
                            <Setting 
                                text={'Pisteraja'} 
                                controlType={CONTROL_TYPES.number}
                                currentValue={10}
                                icon={{
                                    name: 'emoji_events',
                                    className: iconClassnames
                                }}
                            />
                            <Setting 
                                text={'Yleisöäänet käytössä'} 
                                controlType={CONTROL_TYPES.toggle}
                                currentValue={true}
                                icon={{
                                    name: 'thumb_up',
                                    className: iconClassnames
                                }}
                            />
                            <Setting 
                                text={'Kierroksen voittajasta tulee seuraava korttikuningas'} 
                                controlType={CONTROL_TYPES.toggle}
                                currentValue={false}
                                icon={{
                                    name: 'low_priority',
                                    className: iconClassnames
                                }}
                            />
                            <Setting 
                                text={'Potkitut pelaajat eivät voi liittyä takaisin peliin'} 
                                controlType={CONTROL_TYPES.toggle}
                                currentValue={true}
                                icon={{
                                    name: 'remove_circle_outline',
                                    className: iconClassnames
                                }}
                            />
                        </div>
                        <div className="settings-block divider">
                            <h2 className="game-settings-title">
                                Korttipakat
                            </h2>
                            <Setting 
                                text={'Pelin korttipakat'} 
                                controlType={CONTROL_TYPES.custom}
                                icon={{
                                    name: 'filter_none',
                                    className: iconClassnames
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

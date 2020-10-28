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
                                onChangeCallback={() => console.log('clicked')}
                                currentValue={8}
                                isDisabled={false}
                                icon={{
                                    name: 'groups',
                                    className: iconClassnames,
                                    isDisabled: false
                                }}
                            />
                            <Setting 
                                text={'Pisteraja'} 
                                controlType={CONTROL_TYPES.number}
                                onChangeCallback={() => console.log('clicked')}
                                currentValue={10}
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
                                currentValue={true}
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
                                currentValue={false}
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
                                currentValue={true}
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

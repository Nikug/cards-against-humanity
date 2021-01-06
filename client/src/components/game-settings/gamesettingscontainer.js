import React, {Component} from 'react';

import { socket } from "../sockets/socket";

import './../../styles/gamesettings.scss'
import './../../styles/home.scss'

import {Setting, CONTROL_TYPES} from './../settings/setting';
import {CardPack} from './cardpack';

/*
CardPack {
    id: string;
    name: string;
    isNSFW: boolean;
    whiteCards: number;
    blackCards: number;
}

Options {
    maximumPlayers: number;
    scoreLimit: number;
    winnerBecomesCardCzar: boolean;
    allowKickedPlayerJoin: boolean;
    cardPacks: CardPack[];
    selectWhiteCardTimeLimit: number;
    selectBlackCardTimeLimit: number;
}
*/

export class GameSettingsContainer extends Component {
    constructor(props) {
        super(props);

        this.changeMaxPlayers = this.changeMaxPlayers.bind(this);
        this.changeWinScore = this.changeWinScore.bind(this);
        this.changeWhiteCardSelectionTime = this.changeWhiteCardSelectionTime.bind(this);
        this.changeBlackCardSelectionTime = this.changeBlackCardSelectionTime.bind(this);
        this.toggleValue = this.toggleValue.bind(this);
        this.addCardPack = this.addCardPack.bind(this);
        this.removeCardpack = this.removeCardpack.bind(this);
        
    }

    updateOptions(key, value) {
        const {playerID, gameID} = this.props;

        if (!playerID || !gameID) return;
        if (value === undefined) return;

        const newOptions = { ...this.state, [key]: value };

        socket.emit("update_game_options", {
            options: newOptions,
            gameID: gameID,
            playerID: playerID,
        });
    };

    changeMaxPlayers(increase) {
        const oldValue = this.props.options.maximumPlayers;
        let newValue;

        if (increase) {
            newValue= oldValue + 1;
        } else {
            newValue= oldValue - 1;
        }

        if (newValue > 99) {
            return;
        }

        this.updateOptions("maximumPlayers", newValue);
    }

    changeWinScore(increase) {
        const oldValue = this.props.options.scoreLimit;
        let newValue;

        if (increase) {
            newValue= oldValue + 1;
        } else {
            newValue= oldValue - 1;
        }

        if (newValue > 99) {
            return;
        }

        this.updateOptions("scoreLimit", newValue);
    }

    changeWhiteCardSelectionTime(increase) {
        this.changeCardSelectionTime(true, increase);
    }

    changeBlackCardSelectionTime(increase) {
        this.changeCardSelectionTime(false, increase);
    }

    changeCardSelectionTime(isWhite = true, increase) {
        const oldValue = isWhite? this.props.options.selectWhiteCardTimeLimit : this.props.options.selectBlackCardTimeLimit;
        let newValue;

        if (increase) {
            newValue= oldValue + 5;
        } else {
            newValue= oldValue - 5;
        }

        if (newValue > 99) {
            return;
        }

        if (isWhite) {
            this.updateOptions("selectWhiteCardTimeLimit", newValue);
        } else {
            this.updateOptions("selectBlackCardTimeLimit", newValue);
        }
        
    }

    toggleValue(value) {
        const oldValue = this.props.options[value];
        const newValue = !oldValue;

        this.updateOptions(value, newValue);
    }

    addCardPack(id) {
        const {gameID, playerID} = this.props;

        socket.emit("add_card_pack", {
            gameID: gameID,
            cardPackID: id,
            playerID: playerID,
        });
    }

    removeCardpack(id) {
        const {gameID, playerID} = this.props;

        socket.emit("remove_card_pack", {
            gameID: gameID,
            cardPackID: id,
            playerID: playerID,
        });   
    }

    renderCardPacks(cardPacks) {
        const renderedCardPacks = [];

        if (!cardPacks) {
            return;
        }

        cardPacks.forEach(cardPack => {
            const {name, id, isNSFW, whiteCards, blackCards} = cardPack;

            renderedCardPacks.push(
                <CardPack 
                    key={id} 
                    id={id} 
                    name={name} 
                    isNSFW={isNSFW} 
                    whiteCards={whiteCards} 
                    blackCards={blackCards}
                    removeCardpack={this.removeCardpack}
                />
                
            )
        });

        return (
            renderedCardPacks
        );
    }

    render() {
        const isDisabled = this.props.isDisabled;
        const iconClassnames = 'md-36 icon-margin-right';
        const {maximumPlayers, selectWhiteCardTimeLimit, selectBlackCardTimeLimit, scoreLimit, popularVote,
            winnerBecomesCardCzar, allowKickedPlayerJoin, cardPacks} = this.props.options;
        const renderedCardPacks = this.renderCardPacks(cardPacks);

        return (
            <div className={`game-settings-container ${isDisabled ? 'disabled' : ''}`}>
                <div>
                    <div className="game-settings">
                        <div className="settings-block">
                            <h2 className="game-settings-title">
                                Pelin asetukset
                            </h2>
                            <Setting 
                                text={'Pisteraja'} 
                                controlType={CONTROL_TYPES.number}
                                onChangeCallback={this.changeWinScore}
                                currentValue={scoreLimit}
                                isDisabled={isDisabled}
                                icon={{
                                    name: 'emoji_events',
                                    className: iconClassnames,
                                    isDisabled: isDisabled
                                }}
                            />
                            <Setting 
                                text={'Valkoisen kortin valinnan aikaraja'} 
                                controlType={CONTROL_TYPES.number}
                                onChangeCallback={this.changeWhiteCardSelectionTime}
                                currentValue={selectWhiteCardTimeLimit}
                                isDisabled={isDisabled}
                                icon={{
                                    name: 'hourglass_bottom',
                                    className: iconClassnames,
                                    isDisabled: isDisabled
                                }}
                            />
                            <Setting 
                                text={'Mustan kortin valinnan aikaraja'} 
                                controlType={CONTROL_TYPES.number}
                                onChangeCallback={this.changeBlackCardSelectionTime}
                                currentValue={selectBlackCardTimeLimit}
                                isDisabled={isDisabled}
                                icon={{
                                    name: 'hourglass_bottom',
                                    className: iconClassnames,
                                    isDisabled: isDisabled
                                }}
                            />
                            <Setting 
                                text={'Pelaajien enimmäismäärä'} 
                                controlType={CONTROL_TYPES.number}
                                onChangeCallback={this.changeMaxPlayers}
                                currentValue={maximumPlayers}
                                isDisabled={isDisabled}
                                icon={{
                                    name: 'groups',
                                    className: iconClassnames,
                                    isDisabled: isDisabled
                                }}
                            />
                            {false && <Setting 
                                text={'Yleisöäänet käytössä'} 
                                controlType={CONTROL_TYPES.toggle}
                                onChangeCallback={() => this.toggleValue('popularVote')}
                                currentValue={popularVote ? popularVote : false}
                                isDisabled={isDisabled}
                                icon={{
                                    name: 'thumb_up',
                                    className: iconClassnames,
                                    isDisabled: isDisabled
                                }}
                            />}
                            <Setting 
                                text={'Voittajasta tulee seuraava korttikuningas'}
                                controlType={CONTROL_TYPES.toggle}
                                onChangeCallback={() => this.toggleValue('winnerBecomesCardCzar')}
                                currentValue={winnerBecomesCardCzar}
                                isDisabled={isDisabled}
                                icon={{
                                    name: 'low_priority',
                                    className: iconClassnames,
                                    isDisabled: isDisabled
                                }}
                            />
                            <Setting 
                                text={'Potkitut pelaajat voivat liittyä takaisin peliin'} 
                                controlType={CONTROL_TYPES.toggle}
                                onChangeCallback={() => this.toggleValue('allowKickedPlayerJoin')}
                                currentValue={allowKickedPlayerJoin}
                                isDisabled={isDisabled}
                                icon={{
                                    name: 'remove_circle_outline',
                                    className: iconClassnames,
                                    isDisabled: isDisabled
                                }}
                            />
                        </div>
                        <div className="settings-block divider">
                            <h2 className="game-settings-title">
                                Korttipakat
                            </h2>
                            <Setting
                                DEV_CARD_PACK_AUTOFILL={true}
                                text={'Lisää korttipakka'} 
                                placeholderText={'rAnD0MchArs'}
                                controlType={CONTROL_TYPES.textWithConfirm}
                                onChangeCallback={this.addCardPack}
                                customControl={'custom control'}
                                icon={{
                                    name: 'library_add',
                                    className: iconClassnames,
                                    isDisabled: isDisabled
                                }}
                            />
                            <div className="imported-card-packs">
                                Lisätyt korttipakat
                                {renderedCardPacks}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

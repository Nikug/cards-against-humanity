import React, {Component} from 'react';
import { Link } from "react-router-dom";
import './../styles/header.scss'

import Icon from './icon';

export class Header extends Component {
    render() {
        const text = 'Kortit ihmiskuntaa vastaan';
        const {isInGame, toggleIsInGame} = this.props;
        
        return (
            <div className="header">
                <Link to="/">
                    <div className="header-text">
                        {text.toUpperCase()}
                    </div>
                </Link>
                <div className="buttons">
                    <span className="header-button" onClick={() => alert('Tästä aukeaa vielä joskus ehkä asetusvalikko')}>
                        <Icon className="header-icon" name="settings"/>
                        <span className="header-button-text">
                            Asetukset
                        </span>
                    </span>
                    {isInGame && <Link to="/"><span href="/" className="header-button" onClick={() => toggleIsInGame(false)}>
                        <Icon className="header-icon" name="exit_to_app"/>
                        <span className="header-button-text">
                            Poistu
                        </span>
                    </span></Link>}
                </div>
            </div>
        )
    }
}

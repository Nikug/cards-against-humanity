import React, {Component} from 'react';
import './../styles/header.scss'

export class Header extends Component {
    render() {
        const text = 'Kortit ihmiskuntaa vastaan';
        const isInGame = true;

        return (
            <div className="header">
                <div className="header-text">
                    {text.toUpperCase()}
                </div>
                <div className="buttons">
                    <span className="button">Asetukset</span>
                    {isInGame && <span className="button">Poistu</span>}
                </div>
            </div>
        )
    }
}
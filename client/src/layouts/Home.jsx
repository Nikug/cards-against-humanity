import React, {Component} from "react";
import { Redirect } from "react-router-dom";

import "../styles/home.scss"

import Button, { BUTTON_TYPES } from "../components/button";
import {Timer} from "../components/timer";

export class Home extends Component {
    constructor(props) {
        super(props)

        this.state = {
            newUrl: ""
        }
    }

    handleKeyDown(event) {
        if (event.key === 'Enter') {
            this.props.joinExistingGame(this.state.newUrl);
        }
    }

    newUrlChange(event) {
        console.log(event);
        this.setState({newUrl: event.target.value})
    }

    render() {
        const {url, startNewGame, joinExistingGame} = this.props;
        const urlIsEmpty = url === "";

        if (urlIsEmpty) { 
            return (
                <div className="home-wrapper">
                    <h1 className="welcome-text">
                        Tervetuloa pelaamaan kortteja ihmiskuntaa vastaan!
                    </h1>
                    
                    <div className="create-or-join-game-buttons">
                        <div className="container">
                            <div className="text">Luo uusi peli, johon voit kutsua kaverisi mukaan</div>
                            <div className="input-and-button-container">
                            <Button text="Luo peli" type={BUTTON_TYPES.PRIMARY} callback={startNewGame} icon="add_circle_outline"></Button>
                            </div>
                        </div>
                        <div className="container border">
                            <div className="text">Liity olemassa olevaan peliin syöttämällä pelin nimi</div>
                            <div className="input-and-button-container">
                                <input type="text" className="input" placeholder="existing-game-69" onChange={(e) => this.newUrlChange(e)} value={this.state.newUrl} onKeyDown={(e) => this.handleKeyDown(e)}/> 
                                <Button text="Liity peliin" type={BUTTON_TYPES.PRIMARY} callback={joinExistingGame} callbackParams={this.state.newUrl}  icon="login"></Button>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
        
        return (
            <Redirect
                to={{
                    pathname: `/g/${url}`,
                    state: url,
                }}
            />
        );
    }
};

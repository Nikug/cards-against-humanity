import React, { Component } from 'react';

export class CardPicker extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const selector = 'selector';
        const cards = 'cards';

        return (
            <div className="cardpicker-wrapper">
                {selector}
                {cards}
            </div>
        )
    }
}

    import React from 'react';
    import Icon from './icon';

    import '../styles/music.scss';

    export default class Music extends React.Component {
        constructor(props) {
        super(props);
        this.state = {
        play: false
        }
        this.url = "http://streaming.tdiradio.com:8000/house.mp3";
        this.audio = new Audio(this.url);
    }

    toggle = () => {
        const newState = !this.state.play;

        this.setState({ play: newState })

        if (newState) {
        this.audio.play();
        } else {
        this.audio.pause();
        }
    }

    render() {
        const icon = this.state.play ? "pause_circle_outline" : "play_circle_outline"
        return (
            <Icon onClick={this.toggle} name={icon} className="md-light md-inactive music"/>
        );
    }
}
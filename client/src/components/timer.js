// https://medium.com/swlh/creating-an-animated-progress-bar-in-react-5e85e8f6ec16

import React from 'react';

import './../styles/timer.scss';

export function Timer({width, percent, startingPercent, time}) {
    const [value, setValue] = React.useState(0);
    const [startingValue, setStartingValue] = React.useState(0);
    const [timeLeft, setTimeLeft] = React.useState(0);

    React.useEffect(() => {
        setValue(percent * width - startingPercent * width);
        setStartingValue(startingPercent * width);
        setTimeLeft(time - startingPercent * time);
    });

    return (
        <div>
            <div className="progress-div" style={{ width: `${width}%` }}>
                <div style={{ width: `${startingValue}%` }} className="still-progress" />
                <div style={{ width: `${value}%`, transitionDuration: `${timeLeft}s`}} className={`progress ${startingValue > 0 ? 'continuing' : ''}`}/>
            </div>
        </div>
    );
};

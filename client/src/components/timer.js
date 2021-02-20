// https://medium.com/swlh/creating-an-animated-progress-bar-in-react-5e85e8f6ec16

import "./../styles/timer.scss";

import React from "react";

export function Timer({ width, percent = 1, startingPercent, time }) {
    console.log({ percent, startingPercent, time });
    const [value, setValue] = React.useState(0);
    const [startingValue, setStartingValue] = React.useState(0);
    const [timeLeft, setTimeLeft] = React.useState(0);

    React.useEffect(() => {
        const newValue = percent * width - startingPercent * width;
        setValue(newValue < 0 ? 0 : newValue);
        setStartingValue(startingPercent * width);
        setTimeLeft(time - startingPercent * time);
    }, [percent, width, startingPercent, time]);

    return (
        <div>
            <div className="progress-div" style={{ width: `${width}%` }}>
                <div
                    style={{ width: `${startingValue}%` }}
                    className="no-animation"
                />
                <div
                    style={{
                        width: `${value}%`,
                        transitionDuration: `${percent === 0 ? 0 : timeLeft}s`,
                    }}
                    className={`progress ${
                        startingValue > 0 ? "continuing" : ""
                    }`}
                />
            </div>
        </div>
    );
}

import React from 'react';

export const Slider = ({ title, value, changeCallback, changeParams, onMouseUpCallback, min = 0, max = 100 }) => {
    return (
        <div className="slider">
            <div className="title">{title}</div>
            <div className="slider-container">
                <div className="slider-value">{value}</div>
                <input
                    className="slider-input"
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(event) => changeCallback(event, changeParams)}
                    onMouseUp={(event) => onMouseUpCallback(event, changeParams)}
                ></input>
            </div>
        </div>
    );
};

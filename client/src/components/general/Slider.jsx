import React from 'react';

export const Slider = ({ title, value, changeCallback, onMouseUpCallback, min = 0, max = 100 }) => {
    return (
        <div className="slider">
            <div className="title">{title}</div>
            <div className="slider-container">
                <div className="slider-value">{value}</div>
                <input type="range" min={min} max={max} value={value} onChange={changeCallback} onMouseUp={onMouseUpCallback}></input>
            </div>
        </div>
    );
};

import {
    SpinnerCircular,
    SpinnerCircularFixed,
    SpinnerCircularSplit,
    SpinnerDiamond,
    SpinnerDotted,
    SpinnerInfinity,
    SpinnerRound,
    SpinnerRoundFilled,
    SpinnerRoundOutlined,
} from 'spinners-react';

import React from 'react';

//https://www.npmjs.com/package/spinners-react

export const SPINNER_TYPES = {
    SpinnerCircular: 0,
    SpinnerRound: 1,
    SpinnerDotted: 2,
    SpinnerCircularFixed: 3,
    SpinnerRoundOutlined: 4,
    SpinnerInfinity: 5,
    SpinnerCircularSplit: 6,
    SpinnerRoundFilled: 7,
    SpinnerDiamond: 8,
};

const defaultProps = {
    color: '#268bd2',
    style: { width: '100%' },
};

export const Spinner = ({ type }) => {
    switch (type) {
        case SPINNER_TYPES.SpinnerCircular:
            return <SpinnerCircular {...defaultProps} />;
        case SPINNER_TYPES.SpinnerRound:
            return <SpinnerRound {...defaultProps} />;
        case SPINNER_TYPES.SpinnerDotted:
            return <SpinnerDotted {...defaultProps} />;
        case SPINNER_TYPES.SpinnerCircularFixed:
            return <SpinnerCircularFixed {...defaultProps} />;
        case SPINNER_TYPES.SpinnerRoundOutlined:
            return <SpinnerRoundOutlined {...defaultProps} />;
        case SPINNER_TYPES.SpinnerInfinity:
            return <SpinnerInfinity {...defaultProps} />;
        case SPINNER_TYPES.SpinnerCircularSplit:
            return <SpinnerCircularSplit {...defaultProps} />;
        case SPINNER_TYPES.SpinnerRoundFilled:
            return <SpinnerRoundFilled {...defaultProps} />;
        case SPINNER_TYPES.SpinnerDiamond:
            return <SpinnerDiamond {...defaultProps} />;
        default:
            return <SpinnerCircular {...defaultProps} />;
    }
};

function getRandomArbitrary(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

export const getRandomSpinner = () => {
    return <Spinner type={getRandomArbitrary(0, 9)} />;
};

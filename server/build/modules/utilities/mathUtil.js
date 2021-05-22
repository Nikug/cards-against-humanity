"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp = exports.randomBetween = void 0;
const randomBetween = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
exports.randomBetween = randomBetween;
const clamp = (value, min, max) => {
    return Math.max(Math.min(value, max), min);
};
exports.clamp = clamp;

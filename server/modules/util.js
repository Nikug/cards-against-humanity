export const randomBetween = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const clamp = (value, min, max) => {
    return Math.max(Math.min(value, max), min);
};

export const randomBetween = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const clamp = (value: number, min: number, max: number) => {
    return Math.max(Math.min(value, max), min);
};

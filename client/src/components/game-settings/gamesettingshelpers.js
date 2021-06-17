export const CANNOT_CHANGE = "cannot change value";

export const changeValue = (
    value,
    oldValue,
    interval = 1,
    maxValue,
    minValue
) => {
    let newValue;

    switch (value) {
        case "increase":
            newValue = oldValue + interval;
            break;
        case "decrease":
            newValue = oldValue - interval;
            break;
        default:
            newValue = value;
            break;
    }

    if (
        (maxValue != null && newValue > maxValue) ||
        (minValue != null && newValue < minValue)
    ) {
        return CANNOT_CHANGE;
    }

    return newValue;
};

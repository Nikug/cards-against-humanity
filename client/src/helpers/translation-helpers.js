export const translateNotification = (keyWrod, t, options) => {
    if (t == null) {
        return "";
    }

    return t(`notification:${keyWrod}`, options);
};

export const translateCommon = (keyWrod, t, options) => {
    if (t == null) {
        return "";
    }

    return t(`common:${keyWrod}`, options);
};

export const translateUnderWork = (keyWrod, t, options) => {
    if (t == null) {
        return "";
    }

    return t(`underwork:${keyWrod}`, options);
};

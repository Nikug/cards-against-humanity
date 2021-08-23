export let translateNotification = (keyWord, t, options) => {
    if (t == null) {
        return "";
    }
    return t(`notification:${keyWord}`, options);
};

export let translateCommon = (keyWord, t, options) => {
    if (t == null) {
        return "";
    }
    return t(`common:${keyWord}`, options);
};

export let translateUnderWork = (keyWord, t, options) => {
    if (t == null) {
        return "";
    }
    return t(`underwork:${keyWord}`, options);
};

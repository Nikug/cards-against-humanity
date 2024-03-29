export let translateNotification = (keyWrod, t, options) => {
    if (t == null) {
        return '';
    }
    return t(`notification:${keyWrod}`, options);
};

export let translateCommon = (keyWrod, t, options) => {
    if (t == null) {
        console.error('Translation function is missing in translateCommon');
        return '';
    }
    return t(`common:${keyWrod}`, options);
};

export let translateUnderWork = (keyWrod, t, options) => {
    if (t == null) {
        return '';
    }
    return t(`underwork:${keyWrod}`, options);
};

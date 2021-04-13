let timeouts = [];

export const removeTimeout = (id) => {
    const timeout = timeouts.find((timeout) => timeout.id === id);
    if (timeout) clearTimeout(timeout.timeout);
    timeouts = timeouts.filter((timeout) => timeout.id !== id);
};

export const addTimeout = (id, timeout) => {
    timeouts = [...timeouts, { id, timeout }];
};

export const getTimeout = (id) => {
    const timeout = timeouts.find((timeout) => timeout.id === id);
    return timeout?.timeout;
};

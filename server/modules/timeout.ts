interface Timeout {
    id: string;
    timeout: NodeJS.Timeout;
}

let timeouts: Timeout[] = [];

export const removeTimeout = (id: string) => {
    const timeout = timeouts.find((timeout) => timeout.id === id);
    if (timeout) clearTimeout(timeout.timeout);
    timeouts = timeouts.filter((timeout) => timeout.id !== id);
};

export const addTimeout = (id: string, timeout: NodeJS.Timeout) => {
    timeouts = [...timeouts, { id, timeout }];
};

export const getTimeout = (id: string) => {
    const timeout = timeouts.find((timeout) => timeout.id === id);
    return timeout?.timeout;
};

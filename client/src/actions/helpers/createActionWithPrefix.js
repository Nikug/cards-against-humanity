export const createActionWithPrefix = (prefix, action) => {
    return `${prefix}_${action}`;
};

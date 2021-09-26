export const LOCAL_STORAGE_FIELDS = {
    LANGUAGE: 'language',
    HAS_ACCEPTED_COOKIES: 'hasAcceptedCookies',
    PLAYER_ID: 'playerID',
    USER_SETTINGS: 'userSettings',
};

export const setItemToLocalStorage = (field, value) => {
    localStorage.setItem(field, value);
};

export const setJsonToLocalStorage = (field, jsonObj) => {
    const item = jsonObj ? JSON.stringify(jsonObj) : null;

    setItemToLocalStorage(field, item);
};

export const getItemFromLocalStorage = (field) => {
    return localStorage.getItem(field);
};

export const getJsonFromLocalStorage = (field) => {
    const item = getItemFromLocalStorage(field);
    const jsonObj = item ? JSON.parse(item) : null;

    return jsonObj;
};

export const removeItemFromLocalStorage = (field) => {
    return localStorage.removeItem(field);
};

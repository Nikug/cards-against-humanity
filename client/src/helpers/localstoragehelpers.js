export const LOCAL_STORAGE_FIELDS = {
    LANGUAGE: 'language',
    HAS_ACCEPTED_COOKIES: 'hasAcceptedCookies',
    PLAYER_ID: 'playerID'
};

export const setItemToLocalStorage = (field, value) => {
    localStorage.setItem(field, value);
}

export const getItemFromLocalStorage = (field) => {
    return localStorage.getItem(field);
}

export const removeItemFromLocalStorage = (field) => {
    return localStorage.removeItem(field);
}

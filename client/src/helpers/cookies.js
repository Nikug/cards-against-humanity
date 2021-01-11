export function setCookie(cookieText) {
    document.cookie = cookieText;
}

export function getAllCookies() {
    return document.cookie;
}

export function getCookie(cookieName) {
    return document.cookie;
}

export function deleteCookie() {
    document.cookie =
        "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

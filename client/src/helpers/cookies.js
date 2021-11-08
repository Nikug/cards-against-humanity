export function setCookie(cookie, expireTimeInHours = 1) {
    // eslint-disable-next-line no-extend-native
    Date.prototype.addHours = function (h) {
        this.setTime(this.getTime() + h * 60 * 60 * 1000);
        return this;
    };

    const expireDate = new Date().addHours(expireTimeInHours).toUTCString();
    document.cookie = `${cookie.field}=${cookie.value}; expires=${expireDate}; path=/;`;
}

export function getAllCookies() {
    const documentCookie = document.cookie;
    const cookieFields = documentCookie.split(';');
    let cookiesToReturn = {};

    for (let i = 0, len = cookieFields.length; i < len; i++) {
        const field = cookieFields[i];
        const values = field.split('=');

        if (values.length === 2) {
            cookiesToReturn[values[0]] = values[1];
        }
    }

    return cookiesToReturn;
}

export function getCookie(cookieName) {
    const documentCookie = document.cookie;
    const cookieFields = documentCookie.split(';');

    for (let i = 0, len = cookieFields.length; i < len; i++) {
        const field = cookieFields[i].trim();
        const values = field.split('=');

        if (values.length === 2 && values[0] === cookieName) {
            const cookieToReturn = {};
            cookieToReturn[cookieName] = values[1];
            return values[1];
        }
    }

    return null;
}

export function deleteCookie(cookieName = 'username') {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

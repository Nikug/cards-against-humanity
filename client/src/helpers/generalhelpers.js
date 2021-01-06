export function emptyFn() {
    return;
}

export function isNullOrUndefined(obj) {
    return obj === null || obj === undefined;
}

export function containsObjectWithMatchingField(obj, list, fieldName) {
    for (let i = 0, len = list.length; i < len; i++) {
        if (list[i][fieldName] === obj[fieldName]) {
            return true;
        }
    }

    return false;
}

export function containsObjectWithMatchingFieldIndex(obj, list, fieldName) {
    for (let i = 0, len = list.length; i < len; i++) {
        if (list[i][fieldName] === obj[fieldName]) {
            return i;
        }
    }

    return -1;
}

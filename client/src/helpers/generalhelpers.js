export function emptyFn() {
    return;
}

export function isNullOrUndefined(obj) {
    return obj === null || obj === undefined;
}

export function containsObjectWithMatchingField(obj, list, fieldName) {
    for (let i = 0, len = list.length; i < len; i++) {
        const listField = list[i][fieldName];
        const objField = obj[fieldName];
        if (Array.isArray(listField) && Array.isArray(objField)) {
            if (listField[0] === objField[0]) {
                return true;
            }
        }
        if (listField === objField) {
            return true;
        }
    }

    return false;
}

export function containsObjectWithMatchingFieldIndex(obj, list, fieldName) {
    for (let i = 0, len = list.length; i < len; i++) {
        const listField = list[i][fieldName];
        const objField = obj[fieldName];
        if (Array.isArray(listField) && Array.isArray(objField)) {
            if (listField[0] === objField[0]) {
                return i;
            }
        }
        if (listField === objField) {
            return i;
        }
    }

    return -1;
}

export function textToSpeech(text) {
    if ("speechSynthesis" in window) {
        const msg = new SpeechSynthesisUtterance();
        msg.lang = "fi";
        msg.rate = 1;
        msg.text = text;
        msg.volume = 0.3;
        window.speechSynthesis.speak(msg);
    }
}

export const sortByProperty = (list, property) => {
    if (!list) {
        return [];
    }

    if (property == null) {
        return list.sort(function(a, b){
            if(a < b) { return -1; }
            if(a > b) { return 1; }
            return 0;
        })
    }

    return list.sort(function(a, b){
        if(a[property] < b[property]) { return -1; }
        if(a[property] > b[property]) { return 1; }
        return 0;
    })
}
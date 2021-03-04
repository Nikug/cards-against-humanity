import React from "react";

const shouldIgnoreClick = (elementsToIgnore, event) => {
    for (let i = 0, len = elementsToIgnore.length; i < len; i++) {
        const ref = elementsToIgnore[i];

        if (ref.current && ref.current.contains(event.target)) {
            return true;
        }
    }

    return false;
};

export function useClickOutside(ref, elementsToIgnore = [], callback) {
    // There was some problem with importing useEffect separately, but this seems to work.
    React.useEffect(() => {
        function handleClickOutside(event) {
            if (shouldIgnoreClick(elementsToIgnore, event)) {
                return;
            }
            if (ref.current && !ref.current.contains(event.target)) {
                callback();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref, callback]);
}

import { useEffect, useRef, useState } from "react";
import "resize-observer-polyfill";

export function usePrevious(value) {
    const ref = useRef();

    useEffect(() => void (ref.current = value), [
value
]);

    return ref.current;
}

export function useMeasure() {
    const ref = useRef();
    const [
bounds,
set
] = useState({ left: 0, top: 0, width: 0, height: 0 });
    const [
ro
] = useState(
        () => new ResizeObserver(([
entry
]) => set(entry.contentRect))
    );

    useEffect(() => {
        if (ref.current) {
            ro.observe(ref.current, { box: "border-box" });
        }

        return () => ro.disconnect();
    }, [
ro
]);

    return [
{ ref },
bounds
];
}

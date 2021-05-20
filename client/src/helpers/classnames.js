/* eslint-disable */

export function classNames() {
    const classes = [
];

    for (let i = 0; i < arguments.length; i++) {
        const arg = arguments[i];

        if (!arg) continue;

        const argType = typeof arg;

        if (argType === "string" || argType === "number") {
            classes.push(arg);
        } else if (Array.isArray(arg)) {
            if (arg.length) {
                const inner = classNames.apply(null, arg);

                if (inner) {
                    classes.push(inner);
                }
            }
        } else if (argType === "object") {
            if (arg.toString === Object.prototype.toString) {
                for (const key in arg) {
                    if (arg[key]) {
                        classes.push(key);
                    }
                }
            } else {
                classes.push(arg.toString());
            }
        }
    }

    return classes.join(" ");
}

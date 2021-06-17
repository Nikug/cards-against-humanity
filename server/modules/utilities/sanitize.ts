import sanitize from "sanitize";

const sanitizer = sanitize();

export const sanitizeString = (value: string, maxLength?: number) => {
    const shortened = value.substr(0, maxLength);
    const clean = sanitizer.value(shortened, "str");

    return clean;
};

import React from "react";

export const Input = ({
    value,
    onKeyDown,
    onChange,
    placeholder,
    className,
    type = "text",
}) => {
    return (
        <input
            type={type}
            className={`input ${className}`}
            placeholder={placeholder}
            onChange={onChange}
            value={value}
            onKeyDown={onKeyDown}
        />
    );
};

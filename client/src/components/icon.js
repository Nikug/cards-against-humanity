import React from "react";
import { emptyFn, isNullOrUndefined } from "../helpers/generalhelpers";

export default function Icon(props) {
    const { name, className, color, onClick } = props;
    const classNames = `
        material-icons 
        ${className ? className : ""} 
        ${color ? color : ""} 
        ${isNullOrUndefined(onClick) ? "" : "clickable"}
    `;
    return (
        <span
            className={classNames}
            onClick={isNullOrUndefined(onClick) ? emptyFn : onClick}
        >
            {name}
        </span>
    );
}

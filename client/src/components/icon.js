import React from 'react';
import "./../styles/icons.scss";

export default function Icon(props) {
    const {name, className, color, onClick} = props;

    return (
        <span className={`material-icons ${className} ${color}`} onClick={onClick}>
            {name}
        </span>
    );
}
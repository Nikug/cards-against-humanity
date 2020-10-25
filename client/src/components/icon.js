import React from 'react';

export default function Icon(props) {
    const {name, className, color} = props;

    return (
        <span className={`material-icons ${className} ${color}`}>
            {name}
        </span>
    )
}
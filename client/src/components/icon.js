import React from 'react';
import "./../styles/icons.scss";

export default function Icon(props) {
    const {name, className, color, onClick} = props;
    const classNames = 'material-icons' + (className ? ` ${className}` : '') + (color ? ` ${color}` : '');

    return (
        <span className={classNames} onClick={onClick}>
            {name}
        </span>
    );
}
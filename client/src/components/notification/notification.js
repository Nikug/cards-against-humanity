import React, { useState, useEffect } from 'react';
import Icon from '../Icon.jsx';

export const NOTIFICATION_TYPES = {
    DEFAULT: 'default',
    ERROR: 'error',
    SUCCESS: 'success',
};

export const Notification = ({ id, text, type, destroy }) => {
    const hide = () => {
        destroy(id);
    };

    const mapType = (type) => {
        switch (type) {
            case NOTIFICATION_TYPES.DEFAULT:
                return NOTIFICATION_TYPES.DEFAULT;
            case NOTIFICATION_TYPES.ERROR:
                return NOTIFICATION_TYPES.ERROR;
            case NOTIFICATION_TYPES.SUCCESS:
                return NOTIFICATION_TYPES.SUCCESS;
            default:
                return NOTIFICATION_TYPES.DEFAULT;
        }
    };

    const mapIcon = (type) => {
        switch (type) {
            case NOTIFICATION_TYPES.DEFAULT:
                return { name: 'info', color: 'blue', className: 'type-icon' };
            case NOTIFICATION_TYPES.ERROR:
                return {
                    name: 'warning',
                    color: 'red',
                    className: 'type-icon',
                };
            case NOTIFICATION_TYPES.SUCCESS:
                return {
                    name: 'check_circle',
                    color: 'green',
                    className: 'type-icon',
                };
            default:
                return { name: 'info', color: 'blue', className: 'type-icon' };
        }
    };

    return (
        <div className={`notification ${mapType(type)}`}>
            <div className="icon-and-text">
                <Icon {...mapIcon(type)} />
                <span className="text">{text}</span>
            </div>
            <div className="dismiss-btn">
                <Icon name={'highlight_off'} color={'white'} onClick={hide} />
            </div>
        </div>
    );
};

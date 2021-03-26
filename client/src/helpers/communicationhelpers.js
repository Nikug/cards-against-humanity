import { socket } from "../components/sockets/socket";

export const socketEmit = (eventName, paramsObject) => {
    socket.emit(eventName, paramsObject);
};

export const socketOn = (eventName, callback, notificationParams = {}) => {
    const { fireNotification } = notificationParams;

    socket.on(eventName, (data) => {
        if (callback) {
            callback(data);
        }

        const notification = data?.notification;

        if (notification && fireNotification) {
            fireNotification(notification, notification.time);
        }
    });
};

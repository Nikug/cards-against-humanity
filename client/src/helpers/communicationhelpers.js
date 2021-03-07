import { socket } from "../components/sockets/socket";
import { NOTIFICATION_TYPES } from "../components/notification/notification";

export const socketEmit = (eventName, paramsObject) => {
    socket.emit(eventName, paramsObject);
};

export const socketOn = (eventName, callback, notificationParams = {}) => {
    const { fireNotification } = notificationParams;

    socket.on(eventName, (data) => {
        callback(data);

        /*
        const notification = {
            text: `Testi notifikaatio, päivitetty data: ${
                data.game ? "game" : ""
            } ${data.players ? "players" : ""} ${data.player ? "player" : ""} ${
                data.options ? "options" : ""
            }`,
            type: NOTIFICATION_TYPES.DEFAULT,
            time: 200,
        };
        */
        const notification = data?.notification;

        if (notification && fireNotification) {
            fireNotification(notification, notification.time);
        }
    });
};

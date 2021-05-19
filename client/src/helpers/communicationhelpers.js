import { socket } from "../components/sockets/socket";
import { translateNotification } from "./translation-helpers";

export const socketEmit = (eventName, paramsObject) => {
    socket.emit(eventName, paramsObject);
};

export const socketOn = (eventName, callback, notificationParams = {}) => {
    const { fireNotification, t } = notificationParams;

    socket.on(eventName, (data) => {
        if (callback) {
            callback(data);
        }

        let notification = data?.notification;

        if (notification && fireNotification) {
            const text = notification?.text;

            if (text && t) {
                const translatedText = translateNotification(
                    notification?.text,
                    t
                );
                if (translatedText.length > 0) {
                    // If there was translation available
                    notification = { ...notification, text: translatedText };
                }
            }
            fireNotification(notification, notification.time);
        }
    });
};

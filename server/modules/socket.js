import { NOTIFICATION_TIME } from "../consts/error.js";
import { sockets } from "../routes/sockets.js";

export const closeSocketWithID = (io, socketID) => {
    const socket = io.of("/").sockets[socketID];
    if (socket) {
        socket.disconnect(true);
    }
};

export const getSocketsWithIDs = (io, socketIDs) => {
    const sockets = io.of("/").sockets;
    const playerSockets = socketIDs.map((id) => sockets[id]);
    return playerSockets;
};

export const sendNotification = (message, type, options) => {
    if (options.io && options.gameID) {
        options.io.in(options.gameID).emit("notification", {
            notification: message,
            type: type,
        });
    } else if (options.socket) {
        options.socket.emit("notification", {
            notification: {
                text: message,
                type: type,
                time: NOTIFICATION_TIME,
            },
        });
    } else if (options.sockets && options.io) {
        const sockets = getSocketsWithIDs(options.io, options.sockets);
        sockets.map((socket) =>
            socket.emit("notification", {
                notification: {
                    text: message,
                    type: type,
                    time: NOTIFICATION_TIME,
                },
            })
        );
    } else {
        throw new Error("Incorrect parameters in sendNotification");
    }
};

export const removeDisconnectedSockets = (io, socketIDs) => {
    return socketIDs.filter(
        (socket) => io.of("/").sockets[socket] !== undefined
    );
};

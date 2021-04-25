import type * as CAH from "types";
import type * as SocketIO from "socket.io";

import { NOTIFICATION_TIME } from "../consts/error";
import { PoolClient } from "pg";

export const closeSocketWithID = (io: SocketIO.Server, socketID: string) => {
    const socket = io.of("/").sockets[socketID];
    if (socket) {
        socket.disconnect(true);
    }
};

export const getSocketsWithIDs = (io: SocketIO.Server, socketIDs: string[]) => {
    const sockets = io.of("/").sockets;
    const playerSockets = socketIDs.map((id) => sockets[id]);
    return playerSockets;
};

export const sendNotification = (
    message: string,
    type: CAH.NotificationType,
    options: CAH.NotificationOptions
) => {
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

export const removeDisconnectedSockets = (
    io: SocketIO.Server,
    socketIDs: string[]
) => {
    return socketIDs.filter(
        (socket) => io.of("/").sockets[socket] !== undefined
    );
};

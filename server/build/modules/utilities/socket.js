"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeDisconnectedSockets = exports.sendNotification = exports.getSocketsWithIDs = exports.closeSocketWithID = void 0;
const error_1 = require("../../consts/error");
const closeSocketWithID = (io, socketID) => {
    // @ts-ignore
    const socket = io.sockets[socketID];
    if (socket) {
        socket.disconnect(true);
    }
};
exports.closeSocketWithID = closeSocketWithID;
const getSocketsWithIDs = (io, socketIDs) => {
    const sockets = io.sockets;
    // @ts-ignore
    const playerSockets = socketIDs.map((id) => sockets[id]);
    return playerSockets;
};
exports.getSocketsWithIDs = getSocketsWithIDs;
const sendNotification = (message, type, options) => {
    if (options.io && options.gameID) {
        options.io.in(options.gameID).emit("notification", {
            notification: message,
            type: type,
        });
    }
    else if (options.socket) {
        options.socket.emit("notification", {
            notification: {
                text: message,
                type: type,
                time: error_1.NOTIFICATION_TIME,
            },
        });
    }
    else if (options.sockets && options.io) {
        const sockets = exports.getSocketsWithIDs(options.io, options.sockets);
        sockets.map((socket) => socket.emit("notification", {
            notification: {
                text: message,
                type: type,
                time: error_1.NOTIFICATION_TIME,
            },
        }));
    }
    else {
        throw new Error("Incorrect parameters in sendNotification");
    }
};
exports.sendNotification = sendNotification;
const removeDisconnectedSockets = (io, socketIDs) => {
    return socketIDs.filter(
    // @ts-ignore
    (socket) => io.sockets[socket] !== undefined);
};
exports.removeDisconnectedSockets = removeDisconnectedSockets;

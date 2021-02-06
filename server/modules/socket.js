export const closeSocketWithID = (io, socketID) => {
    const socket = io.of("/").sockets[socketID];
    if (socket) {
        socket.disconnect(true);
    }
};

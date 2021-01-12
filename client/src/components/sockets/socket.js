import io from "socket.io-client";

const socket = io();
//console.log("opening the socket", socket);

export { socket };

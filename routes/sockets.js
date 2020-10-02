import { joinGame, updateGameOptions } from "./socketFunctions.js";

export const sockets = (io) => {
    io.on("connection", (socket) => {
        console.log(`Client joined! ID: ${socket.id}`);
    
        socket.on("join_game", (id) => {
            joinGame(socket, id);
        });

        socket.on("update_game_options", (newOptions) => {
            updateGameOptions(socket, newOptions);
        });
    });
    
    io.on("disconnect", (socket) => {
        console.log(`Client left :( ID: ${socket.id}`)
    });
}
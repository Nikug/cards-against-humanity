import { joinToGame, updateGameOptions, updatePlayerName } from "./socketFunctions.js";

export const sockets = (io) => {
    io.on("connection", (socket) => {
        console.log(`Client joined! ID: ${socket.id}`);
    
        socket.on("join_game", (id) => {
            joinToGame(socket, io, id);
        });

        socket.on("update_game_options", (newOptions) => {
            updateGameOptions(socket, newOptions);
        });

        socket.on("set_player_name", (data) => {
            console.log(data);
            updatePlayerName(io, data.id, data.playerID, data.playerName);
        });
    });
    
    io.on("disconnect", (socket) => {
        console.log(`Client left :( ID: ${socket.id}`)
    });
}
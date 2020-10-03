import { joinToGame, updateGameOptions, updatePlayerName, leaveFromGame } from "./socketFunctions.js";

export const sockets = (io) => {
    io.on("connection", (socket) => {
        console.log(`Client joined! ID: ${socket.id}`);
    
        socket.on("join_game", (data) => {
            joinToGame(socket, io, data.gameID);
        });

        socket.on("leave_game", (data) => {
            console.log("Some dude just left");
            socket.disconnect(true);
            leaveFromGame(io, data.gameID, data.playerID);
        });

        socket.on("update_game_options", (data) => {
            updateGameOptions(io, data.gameID, data.options);
        });

        socket.on("set_player_name", (data) => {
            updatePlayerName(io, data.gameID, data.playerID, data.playerName);
        });

    });
    
    io.on("disconnect", (socket) => {
        console.log(`Client left :( ID: ${socket.id}`)
    });
}
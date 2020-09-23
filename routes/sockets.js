import { getGame } from "../modules/game.js";

export const sockets = (io) => {
    io.on("connection", (socket) => {
        console.log(`Client joined! ID: ${socket.id}`);
    
        socket.on("join_game", (id) => {
            console.log(`Join game id ${id}`);
            const game = getGame(id);
            if(game !== null) {
                socket.join(id);
                console.log(`Client joined room ${id}`);
                socket.emit("update_game", getGame(id));
            } else {
                socket.disconnect(true);
                console.log(`Client disconnected :( ${id}`);
            }
        });
    });
    
    io.on("disconnect", (socket) => {
        console.log(`Client left :( ID: ${socket.id}`)
    });
    
    return (req, res, next) => { next() };
}
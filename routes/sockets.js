const Game = require("../game");

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log(`Client joined! ID: ${socket.id}`);
    
        socket.on("join_game", (id) => {
            console.log(`Join game id ${id}`);
            const game = Game.getGame(id);
            if(game !== null) {
                socket.join(id);
                console.log(`Client joined room ${id}`);
                socket.emit("update_game", Game.getGame(id));
            } else {
                socket.disconnect(true);
                console.log(`Client disconnected :( ${id}`);
            }
        });
    });
    
    io.on("disconnect", (socket) => {
        console.log(`Client left :( ID: ${socket.id}`)
    });
    
    return io;
}
import { getGame, setGame } from "../modules/game.js";

export const joinGame = (socket, id) => {
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
}

export const updateGameOptions = (socket, newOptions) => {
    const game = getGame(newOptions.id);
    if(!game) return;

    game.options = {...game.options, ...newOptions};
    const updatedGame = setGame(game);

    socket.to(game.id).emit("update_game_options", updatedGame.options);
}
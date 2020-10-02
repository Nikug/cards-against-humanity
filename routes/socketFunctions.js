import { getGame, setGame, validateOptions, setPlayerName, joinGame } from "../modules/game.js";
import { gameOptions, playerName } from "../consts/gameSettings.js";

export const joinToGame = (socket, io, id) => {
    console.log(`Join game id ${id}`);
    const game = getGame(id);
    if(game !== null) {
        socket.join(id);
        console.log(`Client joined room ${id}`);

        const player = joinGame(id, socket.id);
        io.in(id).emit("update_game", {game: game});
    } else {
        socket.disconnect(true);
        console.log(`Client disconnected :( ${id}`);
    }
}

export const updateGameOptions = (socket, newOptions) => {
    const game = getGame(newOptions.id);
    if(!game) return;

    game.options = validateOptions({...game.options, ...newOptions});
    const updatedGame = setGame(game);

    socket.to(game.id).emit("update_game_options", updatedGame.options);
}

export const updatePlayerName = (io, id, playerID, newName) => {
    const trimmedName = newName.trim();
    if(trimmedName.length < playerName.minimumLength) return;

    const validatedName = trimmedName.substr(0, playerName.maximumLength);
    const players = setPlayerName(id, playerID, validatedName);

    io.to(id).emit("update_player_name", players);
}
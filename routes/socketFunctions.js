import {
    getGame,
    setGame,
    validateOptions,
    setPlayerName,
    joinGame,
} from "../modules/game.js";
import { playerName } from "../consts/gameSettings.js";

export const joinToGame = (socket, io, gameID) => {
    console.log(`Join game id ${gameID}`);

    const game = getGame(gameID);
    if (game !== null) {
        socket.join(gameID);
        console.log(`Client joined room ${gameID}`);

        const player = joinGame(gameID, socket.id);

        io.in(gameID).emit("update_game", { game: game });
        socket.emit("update_player", { player: player });
    } else {
        socket.disconnect(true);
        console.log(`Client disconnected :( ${gameID}`);
    }
};

export const updateGameOptions = (io, gameID, newOptions) => {

    const game = getGame(gameID);
    if (!game) return;

    game.options = validateOptions({ ...game.options, ...newOptions });
    const updatedGame = setGame(game);

    io.in(game.id).emit("update_game_options", {
        options: updatedGame.options,
    });
};

export const updatePlayerName = (io, gameID, playerID, newName) => {
    const trimmedName = newName.trim();
    if (trimmedName.length < playerName.minimumLength) return;

    const validatedName = trimmedName.substr(0, playerName.maximumLength);
    const players = setPlayerName(gameID, playerID, validatedName);

    io.in(gameID).emit("update_player_name", { players: players });
};

export const leaveFromGame = (io, gameID, playerID) => {
    const game = getGame(gameID);
    if (!!game && !!playerID) {
        game.players = game.players.map((player) => {
            player.id === playerID
                ? { ...player, state: "disconnected" }
                : player;
        });
        setGame(game);
        io.in(gameID).emit("update_game", { game: game });
    }
};

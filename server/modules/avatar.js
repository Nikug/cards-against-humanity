import { emitToAllPlayerSockets, publicPlayersObject } from "./player.js";
import { getGame, setGame } from "./game.js";

export const updateAvatar = async (io, gameID, playerID, avatar, client) => {
    if (!validateAvatar(avatar)) return;
    const game = await getGame(gameID, client);
    if (!game) return;

    game.players = setAvatar(game.players, playerID, avatar);
    await setGame(game, client);

    updatePlayers(io, game);
};

export const defaultAvatar = () => {
    return {
        hatType: 0,
        eyeType: 0,
        mouthType: 0,
        skinType: 0,
    };
};

const setAvatar = (players, playerID, avatar) => {
    return players.map((player) => {
        if (player.id === playerID) {
            player.avatar = { ...player.avatar, ...avatar };
        }
        return player;
    });
};

const validateAvatar = (avatar) => {
    const values = Object.values(avatar);
    return values.every((value) => typeof value === "number");
};

const updatePlayers = (io, game) => {
    game.players.map((player) => {
        emitToAllPlayerSockets(io, player, "update_players", {
            players: publicPlayersObject(game.players, player.id),
        });
    });
};

import * as CAH from "types";

import { emitToAllPlayerSockets, publicPlayersObject } from "./player.js";
import { getGame, setGame } from "./game.js";

import { PoolClient } from "pg";
import type SocketIO from "socket.io";

export const updateAvatar = async (
    io: SocketIO.Server,
    gameID: string,
    playerID: string,
    avatar: CAH.Avatar,
    client: PoolClient
) => {
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

const setAvatar = (
    players: CAH.Player[],
    playerID: string,
    avatar: CAH.Avatar
) => {
    return players.map((player) => {
        if (player.id === playerID) {
            player.avatar = { ...player.avatar, ...avatar };
        }
        return player;
    });
};

const validateAvatar = (avatar: CAH.Avatar) => {
    const values = Object.values(avatar);
    return values.every((value) => typeof value === "number");
};

const updatePlayers = (io: SocketIO.Server, game: CAH.Game) => {
    game.players.map((player) => {
        emitToAllPlayerSockets(io, player, "update_players", {
            players: publicPlayersObject(game.players, player.id),
        });
    });
};

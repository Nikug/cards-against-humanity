import * as CAH from "types";
import * as SocketIO from "socket.io";

import { getGame, setGame } from "../games/gameUtil";

import { PoolClient } from "pg";
import { updatePlayersIndividually } from "./emitPlayers";

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

    updatePlayersIndividually(io, game);
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

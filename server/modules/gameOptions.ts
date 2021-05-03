import * as CAH from "types";
import * as SocketIO from "socket.io";
import * as pg from "pg";

import { ERROR_TYPES, NOTIFICATION_TYPES } from "../consts/error";
import { getGame, setGame } from "./gameUtil";
import { validateHost, validateOptions } from "./validate";

import { gameOptions } from "../consts/gameSettings";
import { sendNotification } from "./socket";

export const updateGameOptions = async (
    io: SocketIO.Server,
    socket: SocketIO.Socket,
    gameID: string,
    playerID: string,
    newOptions: CAH.Options,
    client?: pg.PoolClient
) => {
    const game = await getGame(gameID, client);

    if (!game) return;
    if (!validateHost(game, playerID)) {
        sendNotification(
            ERROR_TYPES.forbiddenHostAction,
            NOTIFICATION_TYPES.error,
            { socket: socket }
        );
        return;
    }

    game.client.options = validateOptions({
        ...game.client.options,
        ...newOptions,
    });

    await setGame(game, client);

    io.in(gameID).emit("update_game_options", {
        options: game.client.options,
    });
};

export const checkPlayerLimit = (game: CAH.Game) => {
    const nonSpectators = game.players.filter(
        (player) => player.state !== "spectating"
    );
    return game.client.options.maximumPlayers > nonSpectators.length;
};

export const checkSpectatorLimit = (game: CAH.Game) => {
    const spectators = game.players.filter(
        (player) => player.state === "spectating"
    );
    return gameOptions.spectatorLimit > spectators.length;
};

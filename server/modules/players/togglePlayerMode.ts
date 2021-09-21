import type * as SocketIO from "socket.io";

import { ERROR_TYPES, NOTIFICATION_TYPES } from "../../consts/error";
import { checkPlayerLimit, checkSpectatorLimit } from "../games/gameOptions";
import { findPlayer, setPlayerState } from "./playerUtil";
import { getGame, setGame } from "../games/gameUtil";

import { PoolClient } from "pg";
import { handlePlayerLeaving } from "../connections/disconnect";
import { playerName } from "../../consts/gameSettings";
import { sendNotification } from "../utilities/socket";
import { updatePlayersIndividually } from "./emitPlayers";

export const togglePlayerMode = async (
    io: SocketIO.Server,
    socket: SocketIO.Socket,
    gameID: string,
    playerID: string,
    client?: PoolClient
) => {
    const game = await getGame(gameID, client);
    if (!game) return;

    const player = findPlayer(game.players, playerID);
    if (!player) return;

    if (player.state !== "spectating") {
        if (checkSpectatorLimit(game)) {
            game.players = setPlayerState(game.players, playerID, "spectating");
            await handlePlayerLeaving(io, game, player, true, client);
            return;
        } else {
            sendNotification(
                ERROR_TYPES.spectatorsAreFull,
                NOTIFICATION_TYPES.error,
                { socket: socket }
            );
            return;
        }
    } else {
        if (checkPlayerLimit(game)) {
            if (player.name.length < playerName.minimumLength) {
                game.players = setPlayerState(
                    game.players,
                    playerID,
                    "pickingName"
                );
            } else {
                game.players = setPlayerState(
                    game.players,
                    playerID,
                    game.stateMachine.state === "lobby" ? "active" : "joining"
                );
            }
        } else {
            sendNotification(
                ERROR_TYPES.playersAreFull,
                NOTIFICATION_TYPES.error,
                { socket: socket }
            );
            return;
        }
    }
    await setGame(game, client);
    updatePlayersIndividually(io, game);
};

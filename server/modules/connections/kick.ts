import type * as SocketIO from "socket.io";

import { ERROR_TYPES, NOTIFICATION_TYPES } from "../../consts/error";
import { closeSocketWithID, sendNotification } from "../utilities/socket";
import {
    filterByPublicID,
    getPlayerByPublicID,
    setPlayerState,
} from "../players/playerUtil";

import { PoolClient } from "pg";
import { checkSpectatorLimit } from "../games/gameOptions";
import { getGame } from "../games/gameUtil";
import { handleSpecialCases } from "./disconnect";
import { validateHost } from "../utilities/validate";

export const hostKick = async (
    io: SocketIO.Server,
    socket: SocketIO.Socket,
    gameID: string,
    playerID: string,
    targetID: string,
    removeFromGame: boolean,
    client?: PoolClient
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

    const target = getPlayerByPublicID(game.players, targetID);
    if (!target) return;
    if (target.id === playerID) return; // Host can't kick themself

    if (removeFromGame || !checkSpectatorLimit(game)) {
        game.players = filterByPublicID(game.players, targetID);
        sendNotification(ERROR_TYPES.kickedByHost, NOTIFICATION_TYPES.error, {
            sockets: target.sockets,
            io: io,
        });
        target.sockets.map((socket) => {
            closeSocketWithID(io, socket);
        });
    } else {
        game.players = setPlayerState(game.players, target.id, "spectating");
        sendNotification(
            ERROR_TYPES.movedToSpectators,
            NOTIFICATION_TYPES.error,
            {
                sockets: target.sockets,
                io: io,
            }
        );
    }
    handleSpecialCases(io, game, target, false, client);
};

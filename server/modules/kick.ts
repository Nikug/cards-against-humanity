import type * as CAH from "types";
import type * as SocketIO from "socket.io";

import { ERROR_TYPES, NOTIFICATION_TYPES } from "../consts/error";
import { closeSocketWithID, sendNotification } from "./socket";

import { PoolClient } from "pg";
import { checkSpectatorLimit } from "./join";
import { getGame } from "./game";
import { handleSpecialCases } from "./disconnect";
import { setPlayerState } from "./togglePlayerMode";
import { validateHost } from "./validate";

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

const getPlayerByPublicID = (players: CAH.Player[], targetID: string) => {
    return players.find((player) => player.publicID === targetID);
};

const filterByPublicID = (players: CAH.Player[], targetID: string) => {
    return players.filter((player) => player.publicID !== targetID);
};

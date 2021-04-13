import { ERROR_TYPES, NOTIFICATION_TYPES } from "../consts/error.js";
import { closeSocketWithID, sendNotification } from "./socket.js";

import { checkSpectatorLimit } from "./join.js";
import { getGame } from "./game.js";
import { handleSpecialCases } from "./disconnect.js";
import { setPlayerState } from "./togglePlayerMode.js";
import { validateHost } from "./validate.js";

export const hostKick = async (
    io,
    socket,
    gameID,
    playerID,
    targetID,
    removeFromGame
) => {
    const game = await getGame(gameID);
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
    handleSpecialCases(io, game, target, false);
};

const getPlayerByPublicID = (players, targetID) => {
    return players.find((player) => player.publicID === targetID);
};

const filterByPublicID = (players, targetID) => {
    return players.filter((player) => player.publicID !== targetID);
};

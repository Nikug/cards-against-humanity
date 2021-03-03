import { checkSpectatorLimit } from "./join.js";
import { closeSocketWithID } from "./socket.js";
import { getGame } from "./game.js";
import { handleSpecialCases } from "./disconnect.js";
import { setPlayerState } from "./togglePlayerMode.js";
import { validateHost } from "./validate.js";

export const hostKick = (io, gameID, playerID, targetID, removeFromGame) => {
    const game = getGame(gameID);
    if (!game) return;

    if (!validateHost(game, playerID)) return;

    const target = getPlayerByPublicID(game.players, targetID);
    if (!target) return;
    if (target.id === playerID) return; // Host can't kick themself

    if (removeFromGame || !checkSpectatorLimit(game)) {
        game.players = filterByPublicID(game.players, targetID);
        target.sockets.map((socket) => {
            closeSocketWithID(io, socket);
        });
    } else {
        game.players = setPlayerState(game.players, target.id, "spectating");
    }
    handleSpecialCases(io, game, target);
};

const getPlayerByPublicID = (players, targetID) => {
    return players.find((player) => player.publicID === targetID);
};

const filterByPublicID = (players, targetID) => {
    return players.filter((player) => player.publicID !== targetID);
};

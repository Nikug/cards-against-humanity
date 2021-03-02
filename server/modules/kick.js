import { checkSpectatorLimit } from "./join.js";
import { getGame } from "./game.js";
import { handleSpecialCases } from "./disconnect.js";
import { setPlayerState } from "./togglePlayerMode.js";
import { validateHost } from "./validate.js";

export const hostKick = (io, gameID, playerID, targetID, removeFromGame) => {
    const game = getGame(gameID);
    if (!game) return;

    if (!validateHost(game, playerID)) return;

    const target = getPlayerByPublicID(game.players, targetID);
    if (removeFromGame || !checkSpectatorLimit(game)) {
        game.players = filterByPublicID(game.players, targetID);
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

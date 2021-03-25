import { ERROR_TYPES, NOTIFICATION_TYPES } from "../consts/error.js";
import { checkPlayerLimit, checkSpectatorLimit } from "./join.js";
import { getGame, setGame } from "./game.js";
import { getPlayer, updatePlayersIndividually } from "./player.js";

import { handleSpecialCases } from "./disconnect.js";
import { playerName } from "../consts/gameSettings.js";
import { sendNotification } from "./socket.js";

export const togglePlayerMode = (io, socket, gameID, playerID) => {
    const game = getGame(gameID);
    if (!game) return;

    const player = getPlayer(game, playerID);
    if (!player) return;

    if (player.state !== "spectating") {
        if (checkSpectatorLimit(game)) {
            game.players = setPlayerState(game.players, playerID, "spectating");
            handleSpecialCases(io, game, player);
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
    setGame(game);
    updatePlayersIndividually(io, game);
};

export const setPlayerState = (players, playerID, state) => {
    return players.map((player) =>
        player.id === playerID
            ? {
                  ...player,
                  state: state,
              }
            : player
    );
};

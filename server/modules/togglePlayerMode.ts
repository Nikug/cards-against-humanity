import type * as CAH from "types";
import type * as SocketIO from "socket.io";

import { ERROR_TYPES, NOTIFICATION_TYPES } from "../consts/error";
import { checkPlayerLimit, checkSpectatorLimit } from "./join";
import { getGame, setGame } from "./game";
import { getPlayer, updatePlayersIndividually } from "./player";

import { PoolClient } from "pg";
import { handleSpecialCases } from "./disconnect";
import { playerName } from "../consts/gameSettings";
import { sendNotification } from "./socket";

export const togglePlayerMode = async (
    io: SocketIO.Server,
    socket: SocketIO.Socket,
    gameID: string,
    playerID: string,
    client?: PoolClient
) => {
    const game = await getGame(gameID, client);
    if (!game) return;

    const player = getPlayer(game, playerID);
    if (!player) return;

    if (player.state !== "spectating") {
        if (checkSpectatorLimit(game)) {
            game.players = setPlayerState(game.players, playerID, "spectating");
            await handleSpecialCases(io, game, player, true, client);
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

export const setPlayerState = (
    players: CAH.Player[],
    playerID: string,
    state: CAH.PlayerState
) => {
    return players.map((player) =>
        player.id === playerID
            ? {
                  ...player,
                  state: state,
              }
            : player
    );
};

import * as CAH from "types";
import * as SocketIO from "socket.io";
import * as pg from "pg";

import { ERROR_TYPES, NOTIFICATION_TYPES } from "../consts/error";
import { getGame, setGame } from "./gameUtil";

import { gameOptions } from "../consts/gameSettings";
import { getActivePlayers } from "./playerUtil";
import { resetGame } from "./endGame";
import { sendNotification } from "./socket";
import { updatePlayersIndividually } from "./emitPlayers";
import { validateHost } from "./validate";

export const shouldReturnToLobby = (game: CAH.Game) => {
    if (game.stateMachine.state !== "lobby") {
        const activePlayers = getActivePlayers(game.players);
        if (activePlayers.length < gameOptions.minimumPlayers) {
            return true;
        }
        return game.players.every((player: CAH.Player) =>
            ["disconnected", "pickingName", "spectating"].includes(player.state)
        );
    } else {
        return false;
    }
};

export const returnToLobby = async (
    io: SocketIO.Server,
    game: CAH.Game,
    client?: pg.PoolClient
) => {
    game.stateMachine.returnToLobby();
    game.client.state = game.stateMachine.state;

    const initialGame = resetGame(game);
    await setGame(initialGame, client);

    updatePlayersIndividually(io, initialGame);
};

export const validateHostAndReturnToLobby = async (
    io: SocketIO.Server,
    socket: SocketIO.Socket,
    gameID: string,
    playerID: string,
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

    await returnToLobby(io, game, client);
};

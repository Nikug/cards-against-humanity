import type * as CAH from "types";
import type * as SocketIO from "socket.io";

import {
    ERROR_TYPES,
    NOTIFICATION_TIME,
    NOTIFICATION_TYPES,
} from "../../consts/error";
import {
    closeSocketWithID,
    removeDisconnectedSockets,
    sendNotification,
} from "../utilities/socket";
import {
    emitToAllPlayerSockets,
    updatePlayersIndividually,
} from "../players/emitPlayers";
import { everyoneHasPlayedTurn, getCardCzar } from "../players/playerUtil";
import {
    findGameAndPlayerBySocketID,
    removeGame,
    removeGameIfNoActivePlayers,
    setGame,
    shouldGameBeDeleted,
} from "../games/gameUtil";
import { getActivePlayers, getAllActivePlayers } from "../players/playerUtil";
import { punishCardCzar, setPlayer } from "../players/playerUtil";
import { returnToLobby, shouldReturnToLobby } from "../rounds/returnToLobby";
import { shouldSkipRound, skipRound } from "../rounds/skipRound";

import { INACTIVE_GAME_DELETE_TIME } from "../../consts/gameSettings";
import { PoolClient } from "pg";
import { appointNextCardCzar } from "../players/cardCzar";
import { startReading } from "../rounds/startReading";
import { transactionize } from "../db/util";

export const setPlayerDisconnected = async (
    io: SocketIO.Server,
    socketID: string,
    removePlayer: boolean,
    client?: PoolClient
) => {
    const result = await findGameAndPlayerBySocketID(socketID, client);
    if (!result || !result?.player || !result?.game) return;
    const { game, player } = result;

    const shouldRemove = removePlayer || player.state === "pickingName";
    player.sockets = removeDisconnectedSockets(player.sockets, socketID);

    const remainingSockets = player.sockets.filter(
        (socket: string) => socket !== socketID
    );

    if (remainingSockets.length > 0 && !shouldRemove) {
        player.sockets = remainingSockets;
        game.players = setPlayer(game.players, player);
        await setGame(game, client);
        return;
    }

    if (shouldRemove || player.state === "spectating") {
        player.sockets.map((socket) => closeSocketWithID(io, socket));

        if (
            game.stateMachine.state === "lobby" ||
            game.stateMachine.state === "gameOver"
        ) {
            game.players = game.players.filter(
                (gamePlayer) => gamePlayer.id !== player.id
            );
        } else {
            player.state = "leaving";
            player.sockets = [];
            game.players = setPlayer(game.players, player);
        }
    } else {
        player.state = "disconnected";
        player.sockets = remainingSockets;
        game.players = setPlayer(game.players, player);
    }

    if (shouldGameBeDeleted(game)) {
        if (shouldRemove) {
            removeGame(game.id, client);
            return;
        } else {
            setTimeout(
                () => transactionize(removeGameIfNoActivePlayers, [game.id]),
                INACTIVE_GAME_DELETE_TIME
            );
            await setGame(game, client);
            return;
        }
    }

    if (player.isHost) {
        const newPlayers = handleHostLeaving(game, player, client);
        if (!newPlayers) return;
        game.players = newPlayers;

        const newHost = game.players.find(
            (player: CAH.Player) => player.isHost
        );
        if (!newHost) return;

        emitToAllPlayerSockets(io, newHost, "upgraded_to_host", {
            notification: {
                text: ERROR_TYPES.promotedToHost,
                type: NOTIFICATION_TYPES.default,
                time: NOTIFICATION_TIME,
            },
        });
    }

    handlePlayerLeaving(io, game, player, true, client);
};

export const handlePlayerLeaving = async (
    io: SocketIO.Server,
    game: CAH.Game,
    player: CAH.Player,
    shouldPunishCardCzar: boolean = true,
    client?: PoolClient
) => {
    if (shouldSkipRound(game)) {
        if (player.isCardCzar && shouldPunishCardCzar) {
            game.players = punishCardCzar(game);
        }
        game.players = appointNextCardCzar(game, getCardCzar(game.players)?.id);
        const nextCardCzar = getCardCzar(game.players);
        await skipRound(io, game, nextCardCzar!, client);
        return;
    }

    if (shouldReturnToLobby(game)) {
        await returnToLobby(io, game, client);
        sendNotification(
            ERROR_TYPES.notEnoughPlayers,
            NOTIFICATION_TYPES.default,
            { io: io, gameID: game.id }
        );
        return;
    }

    if (player.isCardCzar && game.stateMachine.state !== "gameOver") {
        handleCardCzarLeaving(io, game, player, shouldPunishCardCzar, client);
        return;
    }

    if (game.stateMachine.state === "playingWhiteCards") {
        handlePlayerLeavingDuringWhiteCardSelection(io, game, client);
        return;
    }
    await setGame(game, client);
    updatePlayersIndividually(io, game);
};

const handlePlayerLeavingDuringWhiteCardSelection = async (
    io: SocketIO.Server,
    game: CAH.Game,
    client?: PoolClient
) => {
    if (everyoneHasPlayedTurn(game)) {
        await startReading(io, game, client);
    } else {
        await setGame(game, client);
        updatePlayersIndividually(io, game);
    }
};

const handleCardCzarLeaving = (
    io: SocketIO.Server,
    game: CAH.Game,
    cardCzar: CAH.Player,
    shouldPunishCardCzar: boolean = true,
    client?: PoolClient
) => {
    if (shouldPunishCardCzar) {
        game.players = punishCardCzar(game);
    }
    game.players = appointNextCardCzar(game, cardCzar.id);
    skipRound(io, game, getCardCzar(game.players)!, client);
};

const handleHostLeaving = (
    game: CAH.Game,
    host: CAH.Player,
    client?: PoolClient
) => {
    const hostIndex = game.players.findIndex((player) => player.id === host.id);
    if (hostIndex !== -1) {
        game.players[hostIndex].isHost = false;
    }

    let players: CAH.Player[] = [];
    if (game.stateMachine.state === "lobby") {
        players = getAllActivePlayers(game.players);
    } else {
        players = getActivePlayers(game.players);
    }

    const activePlayers = players.filter((player) => player.id !== host.id);

    if (activePlayers.length > 0) {
        game.players = game.players.map((player) =>
            player.id === activePlayers[0].id
                ? { ...player, isHost: true }
                : player
        );
    } else {
        removeGame(game.id, client);
        return undefined;
    }
    return [...game.players];
};

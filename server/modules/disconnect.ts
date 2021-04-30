import type * as CAH from "types";
import type * as SocketIO from "socket.io";

import {
    ERROR_TYPES,
    NOTIFICATION_TIME,
    NOTIFICATION_TYPES,
} from "../consts/error";
import {
    appointNextCardCzar,
    emitToAllPlayerSockets,
    getActivePlayers,
    getAllActivePlayers,
    updatePlayersIndividually,
} from "./player";
import {
    closeSocketWithID,
    removeDisconnectedSockets,
    sendNotification,
} from "./socket";
import {
    everyoneHasPlayedTurn,
    findGameAndPlayerBySocketID,
    removeGame,
    removeGameIfNoActivePlayers,
    returnToLobby,
    setGame,
    shouldGameBeDeleted,
    shouldReturnToLobby,
    shouldSkipRound,
    skipRound,
} from "./game";

import { INACTIVE_GAME_DELETE_TIME } from "../consts/gameSettings";
import { PoolClient } from "pg";
import { punishCardCzar } from "./delayedStateChange";
import { setPlayer } from "./join";
import { startReading } from "./card";

export const setPlayerDisconnected = async (
    io: SocketIO.Server,
    socketID: string,
    removePlayer: boolean,
    client?: PoolClient
) => {
    const result = await findGameAndPlayerBySocketID(socketID, client);
    if (!result) return;

    const { game, player } = result;
    if (!player || !game) return;

    player.sockets = removeDisconnectedSockets(io, player.sockets);

    const remainingSockets = player.sockets.filter(
        (socket: string) => socket !== socketID
    );
    if (remainingSockets.length > 0 && !removePlayer) {
        player.sockets = remainingSockets;
        game.players = setPlayer(game.players, player);
        await setGame(game, client);
        return;
    }

    if (removePlayer || player.state === "spectating") {
        game.players = game.players.filter(
            (gamePlayer: CAH.Player) => gamePlayer.id !== player.id
        );
        player.sockets.map((socket: string) => {
            closeSocketWithID(io, socket);
        });
    } else {
        player.state = "disconnected";
        player.sockets = remainingSockets;
        game.players = setPlayer(game.players, player);
    }

    if (shouldGameBeDeleted(game)) {
        if (removePlayer) {
            removeGame(game.id, client);
            return;
        } else {
            setTimeout(
                () => removeGameIfNoActivePlayers(game.id),
                INACTIVE_GAME_DELETE_TIME
            );
            await setGame(game, client);
            return;
        }
    }

    if (player.isHost) {
        game.players = handleHostLeaving(game, player, client);
        if (!game.players) return;

        const newHost = game.players.find(
            (player: CAH.Player) => player.isHost
        );
        emitToAllPlayerSockets(io, newHost, "upgraded_to_host", {
            notification: {
                text: ERROR_TYPES.promotedToHost,
                type: NOTIFICATION_TYPES.default,
                time: NOTIFICATION_TIME,
            },
        });
    }

    handleSpecialCases(io, game, player, true, client);
};

export const handleSpecialCases = async (
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

    if (player.isCardCzar) {
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

const getCardCzar = (players: CAH.Player[]) =>
    players.find((player) => player.isCardCzar);

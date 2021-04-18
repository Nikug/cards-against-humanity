import {
    ERROR_TYPES,
    NOTIFICATION_TIME,
    NOTIFICATION_TYPES,
} from "../consts/error.js";
import {
    appointNextCardCzar,
    emitToAllPlayerSockets,
    getActivePlayers,
    getAllActivePlayers,
    updatePlayersIndividually,
} from "./player.js";
import { closeSocketWithID, sendNotification } from "./socket.js";
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
} from "./game.js";

import { INACTIVE_GAME_DELETE_TIME } from "../consts/gameSettings.js";
import { punishCardCzar } from "./delayedStateChange.js";
import { setPlayer } from "./join.js";
import { startReading } from "./card.js";

export const setPlayerDisconnected = async (
    io,
    socketID,
    removePlayer,
    client
) => {
    const result = await findGameAndPlayerBySocketID(socketID, client);
    if (!result) return;

    const { game, player } = result;
    if (!player) return;

    const remainingSockets = player.sockets.filter(
        (socket) => socket !== socketID
    );
    if (remainingSockets.length > 0 && !removePlayer) {
        player.sockets = remainingSockets;
        game.players = setPlayer(game.players, player);
        await setGame(game, client);
        return;
    }

    if (removePlayer || player.state === "spectating") {
        game.players = game.players.filter(
            (gamePlayer) => gamePlayer.id !== player.id
        );
        player.sockets.map((socket) => {
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

        const newHost = game.players.find((player) => player.isHost);
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
    io,
    game,
    player,
    shouldPunishCardCzar = true,
    client
) => {
    if (shouldSkipRound(game)) {
        if (player.isCardCzar && shouldPunishCardCzar) {
            game.players = punishCardCzar(game);
        }
        game.players = appointNextCardCzar(game, getCardCzar(game.players)?.id);
        const nextCardCzar = getCardCzar(game.players);
        await skipRound(io, game, nextCardCzar, client);
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
    io,
    game,
    client
) => {
    if (everyoneHasPlayedTurn(game)) {
        await startReading(io, game, client);
    } else {
        await setGame(game, client);
        updatePlayersIndividually(io, game);
    }
};

const handleCardCzarLeaving = (
    io,
    game,
    cardCzar,
    shouldPunishCardCzar = true,
    client
) => {
    if (shouldPunishCardCzar) {
        game.players = punishCardCzar(game);
    }
    game.players = appointNextCardCzar(game, cardCzar.id);
    skipRound(io, game, getCardCzar(game.players), client);
};

const handleHostLeaving = (game, host, client) => {
    const hostIndex = game.players.findIndex((player) => player.id === host.id);
    if (hostIndex !== -1) {
        game.players[hostIndex].isHost = false;
    }

    let players = [];
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
        console.log("Host left and no one to make new host, removing game...");
        removeGame(game.id, client);
        return undefined;
    }
    return [...game.players];
};

const getCardCzar = (players) => players.find((player) => player.isCardCzar);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSpecialCases = exports.setPlayerDisconnected = void 0;
const error_1 = require("../../consts/error");
const socket_1 = require("../utilities/socket");
const emitPlayers_1 = require("../players/emitPlayers");
const playerUtil_1 = require("../players/playerUtil");
const gameUtil_1 = require("../games/gameUtil");
const playerUtil_2 = require("../players/playerUtil");
const playerUtil_3 = require("../players/playerUtil");
const returnToLobby_1 = require("../rounds/returnToLobby");
const skipRound_1 = require("../rounds/skipRound");
const gameSettings_1 = require("../../consts/gameSettings");
const cardCzar_1 = require("../players/cardCzar");
const startReading_1 = require("../rounds/startReading");
const util_1 = require("../db/util");
const setPlayerDisconnected = async (io, socketID, removePlayer, client) => {
    const result = await gameUtil_1.findGameAndPlayerBySocketID(socketID, client);
    if (!result)
        return;
    const { game, player } = result;
    if (!player || !game)
        return;
    player.sockets = socket_1.removeDisconnectedSockets(io, player.sockets);
    const remainingSockets = player.sockets.filter((socket) => socket !== socketID);
    if (remainingSockets.length > 0 && !removePlayer) {
        player.sockets = remainingSockets;
        game.players = playerUtil_3.setPlayer(game.players, player);
        await gameUtil_1.setGame(game, client);
        return;
    }
    if (removePlayer || player.state === "spectating") {
        game.players = game.players.filter((gamePlayer) => gamePlayer.id !== player.id);
        player.sockets.map((socket) => {
            socket_1.closeSocketWithID(io, socket);
        });
    }
    else {
        player.state = "disconnected";
        player.sockets = remainingSockets;
        game.players = playerUtil_3.setPlayer(game.players, player);
    }
    if (gameUtil_1.shouldGameBeDeleted(game)) {
        if (removePlayer) {
            gameUtil_1.removeGame(game.id, client);
            return;
        }
        else {
            setTimeout(() => util_1.transactionize(gameUtil_1.removeGameIfNoActivePlayers, [game.id]), gameSettings_1.INACTIVE_GAME_DELETE_TIME);
            await gameUtil_1.setGame(game, client);
            return;
        }
    }
    if (player.isHost) {
        game.players = handleHostLeaving(game, player, client);
        if (!game.players)
            return;
        const newHost = game.players.find((player) => player.isHost);
        emitPlayers_1.emitToAllPlayerSockets(io, newHost, "upgraded_to_host", {
            notification: {
                text: error_1.ERROR_TYPES.promotedToHost,
                type: error_1.NOTIFICATION_TYPES.default,
                time: error_1.NOTIFICATION_TIME,
            },
        });
    }
    exports.handleSpecialCases(io, game, player, true, client);
};
exports.setPlayerDisconnected = setPlayerDisconnected;
const handleSpecialCases = async (io, game, player, shouldPunishCardCzar = true, client) => {
    if (skipRound_1.shouldSkipRound(game)) {
        if (player.isCardCzar && shouldPunishCardCzar) {
            game.players = playerUtil_3.punishCardCzar(game);
        }
        game.players = cardCzar_1.appointNextCardCzar(game, playerUtil_1.getCardCzar(game.players)?.id);
        const nextCardCzar = playerUtil_1.getCardCzar(game.players);
        await skipRound_1.skipRound(io, game, nextCardCzar, client);
        return;
    }
    if (returnToLobby_1.shouldReturnToLobby(game)) {
        await returnToLobby_1.returnToLobby(io, game, client);
        socket_1.sendNotification(error_1.ERROR_TYPES.notEnoughPlayers, error_1.NOTIFICATION_TYPES.default, { io: io, gameID: game.id });
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
    await gameUtil_1.setGame(game, client);
    emitPlayers_1.updatePlayersIndividually(io, game);
};
exports.handleSpecialCases = handleSpecialCases;
const handlePlayerLeavingDuringWhiteCardSelection = async (io, game, client) => {
    if (playerUtil_1.everyoneHasPlayedTurn(game)) {
        await startReading_1.startReading(io, game, client);
    }
    else {
        await gameUtil_1.setGame(game, client);
        emitPlayers_1.updatePlayersIndividually(io, game);
    }
};
const handleCardCzarLeaving = (io, game, cardCzar, shouldPunishCardCzar = true, client) => {
    if (shouldPunishCardCzar) {
        game.players = playerUtil_3.punishCardCzar(game);
    }
    game.players = cardCzar_1.appointNextCardCzar(game, cardCzar.id);
    skipRound_1.skipRound(io, game, playerUtil_1.getCardCzar(game.players), client);
};
const handleHostLeaving = (game, host, client) => {
    const hostIndex = game.players.findIndex((player) => player.id === host.id);
    if (hostIndex !== -1) {
        game.players[hostIndex].isHost = false;
    }
    let players = [];
    if (game.stateMachine.state === "lobby") {
        players = playerUtil_2.getAllActivePlayers(game.players);
    }
    else {
        players = playerUtil_2.getActivePlayers(game.players);
    }
    const activePlayers = players.filter((player) => player.id !== host.id);
    if (activePlayers.length > 0) {
        game.players = game.players.map((player) => player.id === activePlayers[0].id
            ? { ...player, isHost: true }
            : player);
    }
    else {
        gameUtil_1.removeGame(game.id, client);
        return undefined;
    }
    return [...game.players];
};

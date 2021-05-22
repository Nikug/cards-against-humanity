"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayerByWhiteCards = exports.getAllButDisconnectedPlayers = exports.getAllActivePlayers = exports.getActiveAndJoiningPlayers = exports.getPlayersWithState = exports.getActivePlayers = exports.getRoundWinner = exports.filterByPublicID = exports.getPlayerByPublicID = exports.setPlayerState = exports.setPlayer = exports.addPlayer = exports.findPlayer = exports.punishCardCzar = exports.updatePlayers = exports.getCardCzar = exports.everyoneHasPlayedTurn = void 0;
const emitPlayers_1 = require("./emitPlayers");
const gameSettings_1 = require("../../consts/gameSettings");
const anonymize_1 = require("../utilities/anonymize");
const everyoneHasPlayedTurn = (game) => {
    const waitingPlayers = game.players.filter((player) => player.state === "waiting" && !player.isCardCzar);
    return waitingPlayers.length === exports.getActivePlayers(game.players).length - 1; // Remove card czar with -1
};
exports.everyoneHasPlayedTurn = everyoneHasPlayedTurn;
const getCardCzar = (players) => players.find((player) => player.isCardCzar);
exports.getCardCzar = getCardCzar;
const updatePlayers = (io, game) => {
    game.players.map((player) => {
        emitPlayers_1.emitToAllPlayerSockets(io, player, "update_players", {
            players: anonymize_1.publicPlayersObject(game.players, player.id),
        });
    });
};
exports.updatePlayers = updatePlayers;
const punishCardCzar = (game) => {
    return game.players.map((player) => {
        if (player.isCardCzar && game.stateMachine.state !== "roundEnd") {
            player.score -= gameSettings_1.gameOptions.notSelectingWinnerPunishment;
        }
        return player;
    });
};
exports.punishCardCzar = punishCardCzar;
const findPlayer = (players, playerID) => {
    return players.find((player) => player.id === playerID);
};
exports.findPlayer = findPlayer;
const addPlayer = (players, player) => {
    return [...players, player];
};
exports.addPlayer = addPlayer;
const setPlayer = (players, newPlayer) => {
    return players.map((player) => player.id === newPlayer.id ? newPlayer : player);
};
exports.setPlayer = setPlayer;
const setPlayerState = (players, playerID, state) => {
    return players.map((player) => player.id === playerID
        ? {
            ...player,
            state: state,
        }
        : player);
};
exports.setPlayerState = setPlayerState;
const getPlayerByPublicID = (players, targetID) => {
    return players.find((player) => player.publicID === targetID);
};
exports.getPlayerByPublicID = getPlayerByPublicID;
const filterByPublicID = (players, targetID) => {
    return players.filter((player) => player.publicID !== targetID);
};
exports.filterByPublicID = filterByPublicID;
const getRoundWinner = (round) => {
    if (!round?.whiteCardsByPlayer)
        return undefined;
    const cards = round.whiteCardsByPlayer.find((cards) => cards.wonRound);
    return cards?.playerID;
};
exports.getRoundWinner = getRoundWinner;
const getActivePlayers = (players) => {
    return players.filter((player) => ["active", "playing", "waiting"].includes(player.state));
};
exports.getActivePlayers = getActivePlayers;
const getPlayersWithState = (players, state) => {
    return players.filter((player) => player.state === state);
};
exports.getPlayersWithState = getPlayersWithState;
const getActiveAndJoiningPlayers = (players) => {
    return players.filter((player) => ["active", "playing", "waiting", "joining"].includes(player.state));
};
exports.getActiveAndJoiningPlayers = getActiveAndJoiningPlayers;
const getAllActivePlayers = (players) => players.filter((player) => ["active", "playing", "waiting", "pickingName"].includes(player.state));
exports.getAllActivePlayers = getAllActivePlayers;
const getAllButDisconnectedPlayers = (players) => players.filter((player) => player.state !== "disconnected");
exports.getAllButDisconnectedPlayers = getAllButDisconnectedPlayers;
const getPlayerByWhiteCards = (game, whiteCardIDs) => {
    if (!game.currentRound)
        return undefined;
    const players = game.currentRound.whiteCardsByPlayer.filter((whiteCardByPlayer) => {
        if (whiteCardIDs.length !== whiteCardByPlayer.whiteCards.length)
            return false;
        const ids = whiteCardByPlayer.whiteCards.map((whiteCard) => whiteCard.id);
        return !whiteCardIDs.some((id) => !ids.includes(id));
    });
    // There should always be exactly one player
    // No more, no less
    return players.length === 1 ? players[0].playerID : undefined;
};
exports.getPlayerByWhiteCards = getPlayerByWhiteCards;

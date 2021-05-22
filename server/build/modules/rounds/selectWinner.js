"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectWinner = void 0;
const playerUtil_1 = require("../players/playerUtil");
const gameUtil_1 = require("../games/gameUtil");
const error_1 = require("../../consts/error");
const score_1 = require("../players/score");
const streak_1 = require("../players/streak");
const delayedStateChange_1 = require("../utilities/delayedStateChange");
const socket_1 = require("../utilities/socket");
const setPlayers_1 = require("../players/setPlayers");
const emitPlayers_1 = require("../players/emitPlayers");
const validate_1 = require("../utilities/validate");
const selectWinner = async (io, socket, gameID, playerID, whiteCardIDs, client) => {
    const game = await gameUtil_1.getGame(gameID, client);
    if (!game || !game.currentRound)
        return;
    const { result, error } = validate_1.validatePickingWinner(game, playerID);
    if (!!error) {
        socket_1.sendNotification(error, error_1.NOTIFICATION_TYPES.error, { socket: socket });
        return;
    }
    const winnerID = playerUtil_1.getPlayerByWhiteCards(game, whiteCardIDs);
    const winner = playerUtil_1.findPlayer(game.players, winnerID);
    if (!winner)
        return;
    game.streak = streak_1.addStreak(game.streak, winner);
    if (!winnerID)
        return;
    game.players = score_1.addScore(game.players, winnerID, 1);
    const updatedCardsByPlayer = game.currentRound.whiteCardsByPlayer.map((cardsByPlayer) => cardsByPlayer.playerID === winnerID
        ? { ...cardsByPlayer, wonRound: true }
        : cardsByPlayer);
    game.currentRound = {
        ...game.currentRound,
        whiteCardsByPlayer: updatedCardsByPlayer,
    };
    const rounds = game.client.rounds.length;
    game.client.rounds[rounds - 1] = game.currentRound;
    game.stateMachine.endRound();
    game.client.state = game.stateMachine.state;
    game.players = setPlayers_1.setPlayersActive(game.players);
    const updatedGame = delayedStateChange_1.changeGameStateAfterTime(io, game, "startRound");
    await gameUtil_1.setGame(updatedGame, client);
    emitPlayers_1.updatePlayersIndividually(io, updatedGame);
};
exports.selectWinner = selectWinner;

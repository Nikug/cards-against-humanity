"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startNewRound = void 0;
const error_1 = require("../../consts/error");
const drawCards_1 = require("../cards/drawCards");
const gameUtil_1 = require("../games/gameUtil");
const validate_1 = require("../utilities/validate");
const cardCzar_1 = require("../players/cardCzar");
const delayedStateChange_1 = require("../utilities/delayedStateChange");
const endGame_1 = require("../games/endGame");
const playerUtil_1 = require("../players/playerUtil");
const socket_1 = require("../utilities/socket");
const setPlayers_1 = require("../players/setPlayers");
const popularVote_1 = require("../cards/popularVote");
const emitPlayers_1 = require("../players/emitPlayers");
const startNewRound = async (io, socket, gameID, playerID, client) => {
    let game = await gameUtil_1.getGame(gameID, client);
    if (!game)
        return undefined;
    if (!validate_1.validateCardCzar(game, playerID)) {
        if (!!socket) {
            socket_1.sendNotification(error_1.ERROR_TYPES.forbiddenCardCzarAction, error_1.NOTIFICATION_TYPES.error, { socket: socket });
        }
        return;
    }
    if (validate_1.validateGameEnding(game)) {
        await endGame_1.endGame(io, game);
        return;
    }
    if (game.stateMachine.cannot("startRound")) {
        if (!!socket) {
            socket_1.sendNotification(error_1.ERROR_TYPES.incorrectGameState, error_1.NOTIFICATION_TYPES.error, { socket: socket });
        }
        return;
    }
    game.stateMachine.startRound();
    game.client.state = game.stateMachine.state;
    game = drawCards_1.replenishWhiteCards(game);
    if (game.client.options.winnerBecomesCardCzar && game.currentRound) {
        const winnerID = playerUtil_1.getRoundWinner(game.currentRound);
        game.players = cardCzar_1.appointNextCardCzar(game, playerID, winnerID);
    }
    else {
        game.players = cardCzar_1.appointNextCardCzar(game, playerID);
    }
    game.players = popularVote_1.setPopularVoteLeader(game.players);
    game.players = setPlayers_1.setPlayersWaiting(game.players);
    const cardCzar = game.players.find((player) => player.isCardCzar) ??
        game.players[0];
    game = drawCards_1.dealBlackCards(io, cardCzar.sockets, game);
    game = delayedStateChange_1.changeGameStateAfterTime(io, game, "startPlayingWhiteCards");
    await gameUtil_1.setGame(game, client);
    emitPlayers_1.updatePlayersIndividually(io, game);
};
exports.startNewRound = startNewRound;

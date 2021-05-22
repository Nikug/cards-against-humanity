"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startGame = void 0;
const drawCards_1 = require("../cards/drawCards");
const gameUtil_1 = require("./gameUtil");
const validate_1 = require("../utilities/validate");
const error_1 = require("../../consts/error");
const delayedStateChange_1 = require("../utilities/delayedStateChange");
const playerUtil_1 = require("../players/playerUtil");
const mathUtil_1 = require("../utilities/mathUtil");
const socket_1 = require("../utilities/socket");
const setPlayers_1 = require("../players/setPlayers");
const shuffleCards_1 = require("../cards/shuffleCards");
const emitPlayers_1 = require("../players/emitPlayers");
const startGame = async (io, socket, gameID, playerID, client) => {
    const game = await gameUtil_1.getGame(gameID, client);
    if (!game)
        return undefined;
    if (!validate_1.validateHost(game, playerID))
        return undefined;
    const { error } = validate_1.validateGameStartRequirements(game);
    if (!!error) {
        socket_1.sendNotification(error, error_1.NOTIFICATION_TYPES.error, { socket: socket });
        return;
    }
    game.stateMachine.startGame();
    game.client.state = game.stateMachine.state;
    const activePlayers = playerUtil_1.getActivePlayers(game.players);
    const cardCzarIndex = mathUtil_1.randomBetween(0, activePlayers.length - 1);
    game.players = game.players.map((player) => player.id === activePlayers[cardCzarIndex].id
        ? { ...player, isCardCzar: true }
        : player);
    game.players = setPlayers_1.setPlayersWaiting(game.players);
    game.cards.whiteCards = shuffleCards_1.shuffleCards([...game.cards.whiteCards]);
    game.cards.blackCards = shuffleCards_1.shuffleCards([...game.cards.blackCards]);
    const gameWithStartingHands = drawCards_1.replenishWhiteCards(game, io);
    const newGame = drawCards_1.dealBlackCards(io, activePlayers[cardCzarIndex].sockets, gameWithStartingHands);
    const updatedGame = delayedStateChange_1.changeGameStateAfterTime(io, newGame, "startPlayingWhiteCards");
    await gameUtil_1.setGame(updatedGame, client);
    emitPlayers_1.updatePlayersIndividually(io, updatedGame);
};
exports.startGame = startGame;

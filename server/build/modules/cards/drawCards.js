"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBlackCards = exports.drawBlackCards = exports.drawWhiteCards = exports.replenishWhiteCards = exports.dealBlackCards = void 0;
const error_1 = require("../../consts/error");
const emitPlayers_1 = require("../players/emitPlayers");
const gameSettings_1 = require("../../consts/gameSettings");
const gameUtil_1 = require("../games/gameUtil");
const socket_1 = require("../utilities/socket");
const shuffleCards_1 = require("./shuffleCards");
const validate_1 = require("../utilities/validate");
const dealBlackCards = (io, socketIDs, game) => {
    const { blackCards, game: newGame } = exports.drawBlackCards(game, gameSettings_1.gameOptions.blackCardsToChooseFrom);
    socketIDs.map((socket) => {
        io.to(socket).emit("deal_black_cards", {
            blackCards: blackCards,
        });
    });
    return newGame;
};
exports.dealBlackCards = dealBlackCards;
const replenishWhiteCards = (game, io = null) => {
    for (let i = 0, limit = game.players.length; i < limit; i++) {
        const player = game.players[i];
        if (!["active", "playing", "waiting"].includes(player.state))
            continue;
        const missingCards = gameSettings_1.gameOptions.startingWhiteCardCount - player.whiteCards.length;
        if (missingCards > 0) {
            const { game: newGame, cards } = exports.drawWhiteCards(game, missingCards);
            player.whiteCards = [...player.whiteCards, ...cards];
            game.cards = newGame.cards;
            game.players[i] = player;
            if (io) {
                emitPlayers_1.emitToAllPlayerSockets(io, player, "update_player", {
                    player: player,
                });
            }
        }
    }
    return game;
};
exports.replenishWhiteCards = replenishWhiteCards;
const drawWhiteCards = (game, count) => {
    if (game.cards.whiteCards.length < count) {
        let cards = [...game.cards.whiteCards];
        if (game.cards.playedWhiteCards.length === 0)
            return { game, cards: [] };
        game.cards.whiteCards = shuffleCards_1.shuffleCards([...game.cards.playedWhiteCards]);
        game.cards.playedWhiteCards = [];
        cards = [
            ...cards,
            ...game.cards.whiteCards.splice(0, count - cards.length),
        ];
        return { game, cards };
    }
    else {
        const drawnCards = game.cards.whiteCards.splice(0, count);
        return { game, cards: drawnCards };
    }
};
exports.drawWhiteCards = drawWhiteCards;
const drawBlackCards = (game, count) => {
    if (game.cards.blackCards.length < count) {
        let blackCards = [...game.cards.blackCards];
        game.cards.blackCards = shuffleCards_1.shuffleCards([...game.cards.playedBlackCards]);
        game.cards.playedBlackCards = [];
        blackCards = [
            ...blackCards,
            ...game.cards.blackCards.splice(0, count - blackCards.length),
        ];
        game.cards.sentBlackCards = [...blackCards];
        return { blackCards, game };
    }
    else {
        const blackCards = game.cards.blackCards.splice(0, count);
        game.cards.sentBlackCards = [...blackCards];
        return { blackCards, game };
    }
};
exports.drawBlackCards = drawBlackCards;
const sendBlackCards = async (socket, gameID, playerID, client) => {
    const game = await gameUtil_1.getGame(gameID, client);
    if (!game)
        return;
    if (!validate_1.validateCardCzar(game, playerID)) {
        socket_1.sendNotification(error_1.ERROR_TYPES.forbiddenCardCzarAction, error_1.NOTIFICATION_TYPES.error, { socket: socket });
        return;
    }
    if (game.stateMachine.state !== "pickingBlackCard") {
        socket_1.sendNotification(error_1.ERROR_TYPES.incorrectGameState, error_1.NOTIFICATION_TYPES.error, { socket: socket });
        return;
    }
    socket.emit("deal_black_cards", {
        blackCards: game.cards.sentBlackCards,
    });
};
exports.sendBlackCards = sendBlackCards;

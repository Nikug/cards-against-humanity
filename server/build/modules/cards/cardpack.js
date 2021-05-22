"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCardPackFromGame = exports.addCardPackToGame = exports.removeCardPack = exports.addCardPack = void 0;
const error_1 = require("../../consts/error");
const gameUtil_1 = require("../games/gameUtil");
const validate_1 = require("../utilities/validate");
const node_fetch_1 = __importDefault(require("node-fetch"));
const sanitize_1 = require("../utilities/sanitize");
const socket_1 = require("../utilities/socket");
const addCardPack = async (io, socket, gameID, cardPackID, playerID, client) => {
    const cleanID = sanitize_1.sanitizeString(cardPackID);
    const url = `https://allbad.cards/api/pack/get?pack=${cleanID}`;
    let json;
    try {
        const res = await node_fetch_1.default(url);
        json = await res.json();
    }
    catch (error) {
        socket_1.sendNotification(error_1.ERROR_TYPES.cardPackWasNotFound, error_1.NOTIFICATION_TYPES.error, { socket: socket });
        return;
    }
    if (json?.message === "Pack not found!") {
        socket_1.sendNotification(error_1.ERROR_TYPES.cardPackWasNotFound, error_1.NOTIFICATION_TYPES.error, { socket: socket });
        return;
    }
    const whiteCards = json.definition.white.map((item, i) => ({
        id: `w-${cleanID}-${i.toString()}`,
        cardPackID: cleanID,
        text: item,
    }));
    const blackCards = json.definition.black.map((item, i) => ({
        id: `b-${cleanID}-${i.toString()}`,
        cardPackID: cleanID,
        text: item.content,
        whiteCardsToPlay: item.pick,
        whiteCardsToDraw: item.draw,
    }));
    const cardPack = {
        id: json.id,
        name: json.definition.pack.name,
        isNSFW: json.isNSFW,
        whiteCards: json.definition.quantity.white,
        blackCards: json.definition.quantity.black,
    };
    const newOptions = await exports.addCardPackToGame(gameID, playerID, cardPack, whiteCards, blackCards, client);
    if (!!newOptions) {
        io.in(gameID).emit("update_game_options", { options: newOptions });
    }
};
exports.addCardPack = addCardPack;
const removeCardPack = async (io, socket, gameID, cardPackID, playerID, client) => {
    const newOptions = await exports.removeCardPackFromGame(socket, gameID, cardPackID, playerID, client);
    if (!!newOptions) {
        io.in(gameID).emit("update_game_options", { options: newOptions });
    }
};
exports.removeCardPack = removeCardPack;
const addCardPackToGame = async (gameID, playerID, cardPack, whiteCards, blackCards, client) => {
    const game = await gameUtil_1.getGame(gameID, client);
    if (!game)
        return undefined;
    if (!validate_1.validateHost(game, playerID))
        return undefined;
    if (game.client.options.cardPacks.some((existingCardPack) => existingCardPack.id === cardPack.id))
        return undefined;
    game.client.options.cardPacks = [
        ...game.client.options.cardPacks,
        cardPack,
    ];
    game.cards.whiteCards = [...game.cards.whiteCards, ...whiteCards];
    game.cards.blackCards = [...game.cards.blackCards, ...blackCards];
    await gameUtil_1.setGame(game, client);
    return game.client.options;
};
exports.addCardPackToGame = addCardPackToGame;
const removeCardPackFromGame = async (socket, gameID, cardPackID, playerID, client) => {
    const game = await gameUtil_1.getGame(gameID, client);
    if (!game)
        return undefined;
    if (!validate_1.validateState(game, "lobby")) {
        socket_1.sendNotification(error_1.ERROR_TYPES.incorrectGameState, error_1.NOTIFICATION_TYPES.error, { socket: socket });
        return;
    }
    if (!validate_1.validateHost(game, playerID)) {
        socket_1.sendNotification(error_1.ERROR_TYPES.forbiddenHostAction, error_1.NOTIFICATION_TYPES.error, { socket: socket });
        return;
    }
    game.client.options.cardPacks = game.client.options.cardPacks.filter((cardPack) => cardPack.id !== cardPackID);
    game.cards.whiteCards = game.cards.whiteCards.filter((card) => card.cardPackID !== cardPackID);
    game.cards.blackCards = game.cards.blackCards.filter((card) => card.cardPackID !== cardPackID);
    await gameUtil_1.setGame(game, client);
    return game.client.options;
};
exports.removeCardPackFromGame = removeCardPackFromGame;

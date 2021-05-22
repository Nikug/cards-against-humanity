"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playWhiteCards = void 0;
const playerUtil_1 = require("../players/playerUtil");
const gameUtil_1 = require("../games/gameUtil");
const error_1 = require("../../consts/error");
const cardUtil_1 = require("./cardUtil");
const socket_1 = require("../utilities/socket");
const startReading_1 = require("../rounds/startReading");
const emitPlayers_1 = require("../players/emitPlayers");
const validate_1 = require("../utilities/validate");
const playWhiteCards = async (io, socket, gameID, playerID, whiteCardIDs, client) => {
    let game = await gameUtil_1.getGame(gameID, client);
    if (!game || !game.currentRound)
        return;
    const { error } = validate_1.validatePlayerPlayingWhiteCards(game, playerID, whiteCardIDs);
    if (!!error) {
        socket_1.sendNotification(error, error_1.NOTIFICATION_TYPES.error, { socket: socket });
        return;
    }
    const player = playerUtil_1.findPlayer(game.players, playerID);
    if (!player)
        return;
    const whiteCards = whiteCardIDs
        .map((id) => player.whiteCards.find((whiteCard) => whiteCard.id === id))
        .filter((whiteCards) => whiteCards);
    player.whiteCards = player.whiteCards.filter((whiteCard) => !whiteCardIDs.includes(whiteCard.id));
    game.cards.playedWhiteCards = [
        ...game.cards.playedWhiteCards,
        ...whiteCards,
    ];
    player.state = "waiting";
    game.players = game.players.map((oldPlayer) => oldPlayer.id === player.id ? player : oldPlayer);
    game.currentRound.whiteCardsByPlayer = [
        ...game.currentRound.whiteCardsByPlayer,
        cardUtil_1.createWhiteCardsByPlayer(whiteCards, playerID, player.name),
    ];
    if (playerUtil_1.everyoneHasPlayedTurn(game)) {
        await startReading_1.startReading(io, game, client);
    }
    else {
        await gameUtil_1.setGame(game, client);
        emitPlayers_1.updatePlayersIndividually(io, game);
    }
};
exports.playWhiteCards = playWhiteCards;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearGameTimer = exports.changeGameStateAfterTime = void 0;
const timeout_1 = require("./timeout");
const playerUtil_1 = require("../players/playerUtil");
const gameUtil_1 = require("../games/gameUtil");
const skipRound_1 = require("../rounds/skipRound");
const cardCzar_1 = require("../players/cardCzar");
const gameSettings_1 = require("../../consts/gameSettings");
const setPlayers_1 = require("../players/setPlayers");
const showWhiteCard_1 = require("../rounds/showWhiteCard");
const startRound_1 = require("../rounds/startRound");
const util_1 = require("../db/util");
const emitPlayers_1 = require("../players/emitPlayers");
const changeGameStateAfterTime = (io, game, transition) => {
    timeout_1.removeTimeout(game.id);
    const delay = timeout_1.getTimeoutTime(game);
    if (delay === undefined) {
        game.client.timers.duration = undefined;
        game.client.timers.passedTime = undefined;
        return game;
    }
    game.client.timers.duration = delay;
    game.client.timers.passedTime = 0;
    const timeout = setTimeout(() => util_1.transactionize(gameStateChange, [io, game.id, transition]), (delay + gameSettings_1.gameOptions.defaultGracePeriod) * 1000);
    timeout_1.addTimeout(game.id, timeout);
    return game;
};
exports.changeGameStateAfterTime = changeGameStateAfterTime;
const clearGameTimer = (game) => {
    timeout_1.removeTimeout(game.id);
    game.client.timers.duration = undefined;
    game.client.timers.passedTime = undefined;
    return game;
};
exports.clearGameTimer = clearGameTimer;
const gameStateChange = async (io, gameID, transition, client) => {
    const game = await gameUtil_1.getGame(gameID, client);
    if (!game)
        return;
    if (game.stateMachine.cannot(transition))
        return;
    let setNewTimeout = "";
    if (transition === "startRound") {
        const cardCzar = playerUtil_1.getCardCzar(game.players);
        if (!cardCzar)
            return;
        startRound_1.startNewRound(io, null, gameID, cardCzar.id, client);
        return;
    }
    else if (transition === "startPlayingWhiteCards") {
        // Cardczar didn't pick a blackcard, appoint next cardczar
        game.players = playerUtil_1.punishCardCzar(game);
        await skipRound_1.restartRound(io, game, client);
        return;
    }
    else if (transition === "startReading") {
        // There might not be any cards to read, in which case skip round
        if (game.currentRound &&
            game.currentRound.whiteCardsByPlayer.length === 0) {
            const cardCzar = playerUtil_1.getCardCzar(game.players);
            if (!cardCzar)
                return;
            game.players = cardCzar_1.appointNextCardCzar(game, cardCzar.id);
            const nextCardCzar = playerUtil_1.getCardCzar(game.players);
            await skipRound_1.skipRound(io, game, nextCardCzar, client);
            return;
        }
        setNewTimeout = "showCards";
    }
    else if (transition === "showCards") {
        // Check if all whitecards have been showed, otherwise show next whitecards
        const cardCzar = playerUtil_1.getCardCzar(game.players);
        if (!cardCzar)
            return;
        await showWhiteCard_1.showWhiteCard(io, null, gameID, cardCzar.id, client);
        return;
    }
    else if (transition === "endRound") {
        // Nothing was voted, remove points from card czar as punishment
        game.players = playerUtil_1.punishCardCzar(game);
        setNewTimeout = "startRound";
    }
    // @ts-ignore
    game.stateMachine[transition]();
    game.client.state = game.stateMachine.state;
    game.players = setPlayers_1.setPlayersActive(game.players);
    if (setNewTimeout != "") {
        const updatedGame = exports.changeGameStateAfterTime(io, game, setNewTimeout);
        await gameUtil_1.setGame(updatedGame, client);
        emitPlayers_1.updatePlayersIndividually(io, updatedGame);
    }
    else {
        await gameUtil_1.setGame(game, client);
        emitPlayers_1.updatePlayersIndividually(io, game);
    }
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startReading = void 0;
const delayedStateChange_1 = require("../utilities/delayedStateChange");
const gameUtil_1 = require("../games/gameUtil");
const shuffleCards_1 = require("../cards/shuffleCards");
const emitPlayers_1 = require("../players/emitPlayers");
const startReading = async (io, game, client) => {
    game.stateMachine.startReading();
    game.client.state = game.stateMachine.state;
    game.currentRound.whiteCardsByPlayer = shuffleCards_1.shuffleCards([
        ...game.currentRound.whiteCardsByPlayer,
    ]);
    const updatedGame = delayedStateChange_1.changeGameStateAfterTime(io, game, "showCards");
    await gameUtil_1.setGame(updatedGame, client);
    emitPlayers_1.updatePlayersIndividually(io, updatedGame);
};
exports.startReading = startReading;

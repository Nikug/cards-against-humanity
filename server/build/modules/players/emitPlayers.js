"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePlayersIndividually = exports.emitToAllPlayerSockets = void 0;
const anonymize_1 = require("../utilities/anonymize");
const emitToAllPlayerSockets = (io, player, message, data) => {
    player.sockets.map((socket) => {
        io.to(socket).emit(message, data);
    });
};
exports.emitToAllPlayerSockets = emitToAllPlayerSockets;
const updatePlayersIndividually = (io, game) => {
    const anonymousClient = { ...anonymize_1.anonymizedGameClient(game) };
    game.players.map((player) => {
        const playerClient = {
            ...anonymousClient,
            rounds: anonymize_1.anonymizeRounds(anonymousClient.rounds, player.id),
        };
        exports.emitToAllPlayerSockets(io, player, "update_game_and_players", {
            game: playerClient,
            players: anonymize_1.publicPlayersObject(game.players, player.id),
            player: player,
        });
    });
};
exports.updatePlayersIndividually = updatePlayersIndividually;

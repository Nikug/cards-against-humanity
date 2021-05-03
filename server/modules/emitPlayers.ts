import * as CAH from "types";
import * as SocketIO from "socket.io";

import {
    anonymizeRounds,
    anonymizedGameClient,
    publicPlayersObject,
} from "./anonymize";

export const emitToAllPlayerSockets = (
    io: SocketIO.Server,
    player: CAH.Player,
    message: string,
    data: Object
) => {
    player.sockets.map((socket) => {
        io.to(socket).emit(message, data);
    });
};

export const updatePlayersIndividually = (
    io: SocketIO.Server,
    game: CAH.Game
) => {
    const anonymousClient = { ...anonymizedGameClient(game) };

    game.players.map((player) => {
        const playerClient = {
            ...anonymousClient,
            rounds: anonymizeRounds(anonymousClient.rounds, player.id),
        };
        emitToAllPlayerSockets(io, player, "update_game_and_players", {
            game: playerClient,
            players: publicPlayersObject(game.players, player.id),
            player: player,
        });
    });
};

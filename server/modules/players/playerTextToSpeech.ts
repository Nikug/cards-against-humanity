import * as SocketIO from "socket.io";
import * as pg from "pg";

import { getGame, setGame } from "../games/gameUtil";

import { findPlayer } from "./playerUtil";
import { updatePlayersIndividually } from "./emitPlayers";

export const changePlayerTextToSpeech = async (
    io: SocketIO.Server,
    gameID: string,
    playerID: string,
    useTTS: boolean,
    client?: pg.PoolClient
) => {
    const game = await getGame(gameID, client);
    if (!game) return;

    const player = findPlayer(game.players, playerID);
    if (!player) return;

    player.useTextToSpeech = !!useTTS;
    game.players = game.players.map((gamePlayer) =>
        gamePlayer.id === player.id ? player : gamePlayer
    );
    await setGame(game, client);

    updatePlayersIndividually(io, game);
};

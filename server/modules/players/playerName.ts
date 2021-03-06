import * as CAH from "types";
import * as SocketIO from "socket.io";

import { getGame, setGame } from "../games/gameUtil";

import { PoolClient } from "pg";
import { findPlayer } from "./playerUtil";
import { playerName } from "../../consts/gameSettings";
import { sanitizeString } from "../utilities/sanitize";
import { updatePlayersIndividually } from "./emitPlayers";

export const updatePlayerName = async (
    io: SocketIO.Server,
    gameID: string,
    playerID: string,
    newName: string,
    client?: PoolClient
) => {
    const game = await getGame(gameID, client);
    if (!game) return;

    const trimmedName = newName.trim();
    if (trimmedName.length < playerName.minimumLength) return;

    const cleanName = sanitizeString(trimmedName, playerName.maximumLength);

    const player = findPlayer(game.players, playerID);
    if (!player) return;

    if (player.state === "pickingName") {
        player.state =
            game.stateMachine.state === "lobby" ? "active" : "joining";
    }
    const newGame = setPlayerName(game, player, cleanName);
    if (!newGame) return;

    await setGame(newGame, client);

    updatePlayersIndividually(io, newGame);
};

export const setPlayerName = (
    game: CAH.Game,
    newPlayer: CAH.Player,
    newName: string
) => {
    if (game) {
        game.players = game.players.map((player) => {
            return player.id === newPlayer.id
                ? { ...newPlayer, name: newName }
                : player;
        });
        return game;
    }
};

import * as CAH from "types";
import * as SocketIO from "socket.io";
import * as pg from "pg";

import { findPlayer, getPlayerByWhiteCards } from "./playerUtil";
import { getGame, setGame } from "./gameUtil";

import { NOTIFICATION_TYPES } from "../consts/error";
import { addScore } from "./score";
import { addStreak } from "./streak";
import { changeGameStateAfterTime } from "./delayedStateChange";
import { sendNotification } from "./socket";
import { setPlayersActive } from "./setPlayers";
import { updatePlayersIndividually } from "./emitPlayers";
import { validatePickingWinner } from "./validate";

export const selectWinner = async (
    io: SocketIO.Server,
    socket: SocketIO.Socket,
    gameID: string,
    playerID: string,
    whiteCardIDs: string[],
    client?: pg.PoolClient
) => {
    const game = await getGame(gameID, client);
    if (!game || !game.currentRound) return;

    const { result, error } = validatePickingWinner(game, playerID);
    if (!!error) {
        sendNotification(error, NOTIFICATION_TYPES.error, { socket: socket });
        return;
    }

    const winnerID = getPlayerByWhiteCards(game, whiteCardIDs);
    const winner = findPlayer(game.players, winnerID);
    if (!winner) return;

    game.streak = addStreak(game.streak, winner);
    if (!winnerID) return;
    game.players = addScore(game.players, winnerID, 1);

    const updatedCardsByPlayer = game.currentRound.whiteCardsByPlayer.map(
        (cardsByPlayer: CAH.WhiteCardsByPlayer) =>
            cardsByPlayer.playerID === winnerID
                ? { ...cardsByPlayer, wonRound: true }
                : cardsByPlayer
    );
    game.currentRound = {
        ...game.currentRound,
        whiteCardsByPlayer: updatedCardsByPlayer,
    };

    const rounds = game.client.rounds.length;
    game.client.rounds[rounds - 1] = game.currentRound;

    game.stateMachine.endRound();
    game.client.state = game.stateMachine.state;

    game.players = setPlayersActive(game.players);

    const updatedGame = changeGameStateAfterTime(io, game, "startRound");
    await setGame(updatedGame, client);
    updatePlayersIndividually(io, updatedGame);
};

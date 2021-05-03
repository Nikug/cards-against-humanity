import * as CAH from "types";
import * as SocketIO from "socket.io";
import * as pg from "pg";

import { ERROR_TYPES, NOTIFICATION_TYPES } from "../consts/error";
import { dealBlackCards, replenishWhiteCards } from "./drawCards";
import { getGame, setGame } from "./gameUtil";
import { validateCardCzar, validateGameEnding } from "./validate";

import { appointNextCardCzar } from "./cardCzar";
import { changeGameStateAfterTime } from "./delayedStateChange";
import { endGame } from "./endGame";
import { getRoundWinner } from "./playerUtil";
import { sendNotification } from "./socket";
import { setPlayersWaiting } from "./setPlayers";
import { setPopularVoteLeader } from "./popularVote";
import { updatePlayersIndividually } from "./emitPlayers";

export const startNewRound = async (
    io: SocketIO.Server,
    socket: SocketIO.Socket | null,
    gameID: string,
    playerID: string,
    client?: pg.PoolClient
) => {
    let game = await getGame(gameID, client);
    if (!game) return undefined;

    if (!validateCardCzar(game, playerID)) {
        if (!!socket) {
            sendNotification(
                ERROR_TYPES.forbiddenCardCzarAction,
                NOTIFICATION_TYPES.error,
                { socket: socket }
            );
        }
        return;
    }

    if (validateGameEnding(game)) {
        await endGame(io, game);
        return;
    }

    if (game.stateMachine.cannot("startRound")) {
        if (!!socket) {
            sendNotification(
                ERROR_TYPES.incorrectGameState,
                NOTIFICATION_TYPES.error,
                { socket: socket }
            );
        }
        return;
    }

    game.stateMachine.startRound();
    game.client.state = game.stateMachine.state;

    game = replenishWhiteCards(game);

    if (game.client.options.winnerBecomesCardCzar && game.currentRound) {
        const winnerID = getRoundWinner(game.currentRound);
        game.players = appointNextCardCzar(game, playerID, winnerID);
    } else {
        game.players = appointNextCardCzar(game, playerID);
    }

    game.players = setPopularVoteLeader(game.players);
    game.players = setPlayersWaiting(game.players);

    const cardCzar =
        game.players.find((player: CAH.Player) => player.isCardCzar) ??
        game.players[0];

    game = dealBlackCards(io, cardCzar.sockets, game);

    game = changeGameStateAfterTime(io, game, "startPlayingWhiteCards");
    await setGame(game, client);
    updatePlayersIndividually(io, game);
};

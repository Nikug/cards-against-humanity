import * as CAH from "types";
import * as SocketIO from "socket.io";
import * as pg from "pg";

import { ERROR_TYPES, NOTIFICATION_TYPES } from "../../consts/error";
import { dealBlackCards, replenishWhiteCards } from "../cards/drawCards";
import { getGame, setGame } from "../games/gameUtil";
import { validateCardCzar, validateGameEnding } from "../utilities/validate";

import { appointNextCardCzar } from "../players/cardCzar";
import { changeGameStateAfterTime } from "../utilities/delayedStateChange";
import { endGame } from "../games/endGame";
import { getRoundWinner } from "../players/playerUtil";
import { sendNotification } from "../utilities/socket";
import { setPlayersWaiting } from "../players/setPlayers";
import { setPopularVoteLeader } from "../cards/popularVote";
import { updatePlayersIndividually } from "../players/emitPlayers";

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

    game = replenishWhiteCards(game);
    game = dealBlackCards(io, cardCzar.sockets, game);

    game = changeGameStateAfterTime(io, game, "startPlayingWhiteCards");
    await setGame(game, client);
    updatePlayersIndividually(io, game);
};

import * as SocketIO from "socket.io";
import * as pg from "pg";

import { getGame, setGame } from "../games/gameUtil";

import { NOTIFICATION_TYPES } from "../../consts/error";
import { changeGameStateAfterTime } from "../utilities/delayedStateChange";
import { sendNotification } from "../utilities/socket";
import { updatePlayersIndividually } from "../players/emitPlayers";
import { updateTimers } from "../utilities/timeout";
import { validateShowingWhiteCard } from "../utilities/validate";

export const showWhiteCard = async (
    io: SocketIO.Server,
    socket: SocketIO.Socket | null,
    gameID: string,
    playerID: string,
    client?: pg.PoolClient
) => {
    const game = await getGame(gameID, client);
    if (!game || !game.currentRound) return;

    const { error } = validateShowingWhiteCard(game, playerID);
    if (!!error) {
        if (socket !== null) {
            sendNotification(error, NOTIFICATION_TYPES.error, {
                socket: socket,
            });
        }
        return;
    }

    if (
        game.currentRound.cardIndex ===
        game.currentRound.whiteCardsByPlayer.length
    ) {
        game.stateMachine.showCards();
        game.client.state = game.stateMachine.state;

        const rounds = game.client.rounds.length;
        game.client.rounds[rounds - 1] = game.currentRound;

        const updatedGame = changeGameStateAfterTime(io, game, "endRound");
        await setGame(updatedGame, client);

        updatePlayersIndividually(io, updatedGame);
    } else {
        const whiteCards =
            game.currentRound.whiteCardsByPlayer[game.currentRound.cardIndex]
                .whiteCards;
        game.currentRound.cardIndex = game.currentRound.cardIndex + 1;
        const updatedGame = changeGameStateAfterTime(io, game, "showCards");
        await setGame(updatedGame, client);

        io.in(gameID).emit("show_white_card", {
            whiteCards: whiteCards,
            index: updatedGame.currentRound!.cardIndex,
            outOf: updatedGame.currentRound!.whiteCardsByPlayer.length,
        });
        updateTimers(io, updatedGame);
    }
};

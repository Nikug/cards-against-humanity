import type * as CAH from "types";
import type * as SocketIO from "socket.io";

import { clearGameTimer } from "../utilities/delayedStateChange";
import { removeAllCards } from "../cards/resetCards";
import { resetPlayers } from "../players/resetPlayer";
import { setGame } from "./gameUtil";
import { updatePlayersIndividually } from "../players/emitPlayers";

export const endGame = async (io: SocketIO.Server, game: CAH.Game) => {
    if (game.stateMachine.can("endGame")) {
        game.stateMachine.endGame();
        game.client.state = game.stateMachine.state;

        const updatedGame = clearGameTimer(game);

        await setGame(updatedGame);
        updatePlayersIndividually(io, updatedGame);
    }
};

export const resetGame = (game: CAH.Game) => {
    // Clear timeout
    const updatedGame = clearGameTimer(game);

    // Reset rounds
    updatedGame.client.rounds = [];
    updatedGame.currentRound = undefined;

    // Reset playerStates, scores, cardczar status and player white cards
    updatedGame.players = resetPlayers(updatedGame.players);

    // Remove all cards
    const gameWithNoCards = removeAllCards(updatedGame);

    // Reset timers
    gameWithNoCards.client.timers.duration = undefined;
    gameWithNoCards.client.timers.passedTime = undefined;

    // Reset game state if not in lobby
    if (gameWithNoCards.stateMachine.state !== "lobby") {
        gameWithNoCards.stateMachine.returnToLobby();
    }

    return gameWithNoCards;
};

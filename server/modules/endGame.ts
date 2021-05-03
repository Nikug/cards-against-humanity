import type * as CAH from "types";
import type * as SocketIO from "socket.io";

import { clearGameTimer } from "./delayedStateChange";
import { resetPlayers } from "./resetPlayer";
import { setGame } from "./gameUtil";
import { updatePlayersIndividually } from "./emitPlayers";

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

    // Reset played cards back to deck
    updatedGame.cards.whiteCards = [
        ...updatedGame.cards.whiteCards,
        ...updatedGame.cards.playedWhiteCards,
    ];
    updatedGame.cards.blackCards = [
        ...updatedGame.cards.blackCards,
        ...updatedGame.cards.playedBlackCards,
    ];

    // Reset timers
    updatedGame.client.timers.duration = undefined;
    updatedGame.client.timers.passedTime = undefined;

    // Reset game state if not in lobby
    if (updatedGame.stateMachine.state !== "lobby") {
        updatedGame.stateMachine.returnToLobby();
    }

    return updatedGame;
};

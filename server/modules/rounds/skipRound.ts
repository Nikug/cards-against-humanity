import * as CAH from "types";
import * as SocketIO from "socket.io";
import * as pg from "pg";

import { dealBlackCards, replenishWhiteCards } from "../cards/drawCards";
import {
    getActivePlayers,
    getCardCzar,
    getPlayersWithState,
} from "../players/playerUtil";

import { appointNextCardCzar } from "../players/cardCzar";
import { changeGameStateAfterTime } from "../utilities/delayedStateChange";
import { endGame } from "../games/endGame";
import { gameOptions } from "../../consts/gameSettings";
import { removeLeavingPlayers } from "./startRound";
import { returnToLobby } from "./returnToLobby";
import { setGame } from "../games/gameUtil";
import { setPlayersWaiting } from "../players/setPlayers";
import { shuffleCardsBackToDeck } from "../cards/shuffleCards";
import { updatePlayersIndividually } from "../players/emitPlayers";
import { validateGameEnding } from "../utilities/validate";

export const skipRound = async (
    io: SocketIO.Server,
    game: CAH.Game,
    newCardCzar: CAH.Player,
    client?: pg.PoolClient
) => {
    if (game.stateMachine.state === "roundEnd" && validateGameEnding(game)) {
        await endGame(io, game, client);
        return;
    }

    const newGame = replenishWhiteCards(game);

    newGame.stateMachine.skipRound();
    newGame.client.state = newGame.stateMachine.state;

    newGame.players = removeLeavingPlayers(io, newGame.players);
    newGame.players = setPlayersWaiting(newGame.players);

    const newerGame = dealBlackCards(io, newCardCzar.sockets, newGame);

    const updatedGame = changeGameStateAfterTime(
        io,
        newerGame,
        "startPlayingWhiteCards"
    );
    await setGame(updatedGame, client);
    updatePlayersIndividually(io, updatedGame);
};

export const shouldSkipRound = (game: CAH.Game) => {
    if (
        game.stateMachine.state === "lobby" ||
        game.stateMachine.state === "gameOver"
    )
        return false;

    const activePlayerCount = getActivePlayers(game.players).length;
    const joiningPlayerCount = getPlayersWithState(
        game.players,
        "joining"
    ).length;
    return (
        activePlayerCount < gameOptions.minimumPlayers &&
        activePlayerCount + joiningPlayerCount >= gameOptions.minimumPlayers
    );
};

export const restartRound = async (
    io: SocketIO.Server,
    game: CAH.Game,
    client?: pg.PoolClient
) => {
    const cardCzar = getCardCzar(game.players);
    if (!cardCzar) return;

    game.cards.blackCards = shuffleCardsBackToDeck(
        [...game.cards.sentBlackCards],
        game.cards.blackCards
    );
    game.cards.sentBlackCards = [];

    game.players = appointNextCardCzar(game, cardCzar.id);
    const nextCardCzar = getCardCzar(game.players);

    if (!nextCardCzar) {
        returnToLobby(io, game, client);
        return;
    }
    await skipRound(io, game, nextCardCzar, client);
};

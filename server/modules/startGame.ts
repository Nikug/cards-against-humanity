import * as CAH from "types";
import * as SocketIO from "socket.io";
import * as pg from "pg";

import { dealBlackCards, replenishWhiteCards } from "./drawCards";
import { getGame, setGame } from "./gameUtil";
import { validateGameStartRequirements, validateHost } from "./validate";

import { NOTIFICATION_TYPES } from "../consts/error";
import { changeGameStateAfterTime } from "./delayedStateChange";
import { getActivePlayers } from "./playerUtil";
import { randomBetween } from "./mathUtil";
import { sendNotification } from "./socket";
import { setPlayersWaiting } from "./setPlayers";
import { shuffleCards } from "./shuffleCards";
import { updatePlayersIndividually } from "./emitPlayers";

export const startGame = async (
    io: SocketIO.Server,
    socket: SocketIO.Socket,
    gameID: string,
    playerID: string,
    client?: pg.PoolClient
) => {
    const game = await getGame(gameID, client);
    if (!game) return undefined;

    if (!validateHost(game, playerID)) return undefined;

    const { error } = validateGameStartRequirements(game);
    if (!!error) {
        sendNotification(error, NOTIFICATION_TYPES.error, { socket: socket });
        return;
    }

    game.stateMachine.startGame();
    game.client.state = game.stateMachine.state;

    const activePlayers = getActivePlayers(game.players);
    const cardCzarIndex = randomBetween(0, activePlayers.length - 1);
    game.players = game.players.map((player: CAH.Player) =>
        player.id === activePlayers[cardCzarIndex].id
            ? { ...player, isCardCzar: true }
            : player
    );
    game.players = setPlayersWaiting(game.players);

    game.cards.whiteCards = shuffleCards([...game.cards.whiteCards]);
    game.cards.blackCards = shuffleCards([...game.cards.blackCards]);

    const gameWithStartingHands = replenishWhiteCards(game, io);

    const newGame = dealBlackCards(
        io,
        activePlayers[cardCzarIndex].sockets,
        gameWithStartingHands
    );

    const updatedGame = changeGameStateAfterTime(
        io,
        newGame,
        "startPlayingWhiteCards"
    );

    await setGame(updatedGame, client);
    updatePlayersIndividually(io, updatedGame);
};

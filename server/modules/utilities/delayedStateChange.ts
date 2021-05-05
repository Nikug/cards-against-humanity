import type * as CAH from "types";
import type * as SocketIO from "socket.io";

import { addTimeout, getTimeoutTime, removeTimeout } from "./timeout";
import { getCardCzar, punishCardCzar } from "../players/playerUtil";
import { getGame, setGame } from "../games/gameUtil";
import { restartRound, skipRound } from "../rounds/skipRound";

import { PoolClient } from "pg";
import { appointNextCardCzar } from "../players/cardCzar";
import { gameOptions } from "../../consts/gameSettings";
import { setPlayersActive } from "../players/setPlayers";
import { showWhiteCard } from "../rounds/showWhiteCard";
import { startNewRound } from "../rounds/startRound";
import { transactionize } from "../db/util";
import { updatePlayersIndividually } from "../players/emitPlayers";

export const changeGameStateAfterTime = (
    io: SocketIO.Server,
    game: CAH.Game,
    transition: string
) => {
    removeTimeout(game.id);

    const delay = getTimeoutTime(game);
    if (delay === undefined) {
        game.client.timers.duration = undefined;
        game.client.timers.passedTime = undefined;
        return game;
    }

    game.client.timers.duration = delay;
    game.client.timers.passedTime = 0;

    const timeout = setTimeout(
        () => transactionize(gameStateChange, [io, game.id, transition]),
        (delay + gameOptions.defaultGracePeriod) * 1000
    );
    addTimeout(game.id, timeout);
    return game;
};

export const clearGameTimer = (game: CAH.Game) => {
    removeTimeout(game.id);
    game.client.timers.duration = undefined;
    game.client.timers.passedTime = undefined;
    return game;
};

const gameStateChange = async (
    io: SocketIO.Server,
    gameID: string,
    transition: string,
    client?: PoolClient
) => {
    const game = await getGame(gameID, client);
    if (!game) return;

    if (game.stateMachine.cannot(transition)) return;

    let setNewTimeout = "";

    if (transition === "startRound") {
        const cardCzar = getCardCzar(game.players);
        if (!cardCzar) return;
        startNewRound(io, null, gameID, cardCzar.id, client);
        return;
    } else if (transition === "startPlayingWhiteCards") {
        // Cardczar didn't pick a blackcard, appoint next cardczar
        game.players = punishCardCzar(game);
        await restartRound(io, game, client);
        return;
    } else if (transition === "startReading") {
        // There might not be any cards to read, in which case skip round
        if (
            game.currentRound &&
            game.currentRound.whiteCardsByPlayer.length === 0
        ) {
            const cardCzar = getCardCzar(game.players);
            if (!cardCzar) return;

            game.players = appointNextCardCzar(game, cardCzar.id);
            const nextCardCzar = getCardCzar(game.players);

            await skipRound(io, game, nextCardCzar!, client);
            return;
        }
        setNewTimeout = "showCards";
    } else if (transition === "showCards") {
        // Check if all whitecards have been showed, otherwise show next whitecards
        const cardCzar = getCardCzar(game.players);
        if (!cardCzar) return;
        await showWhiteCard(io, null, gameID, cardCzar.id, client);
        return;
    } else if (transition === "endRound") {
        // Nothing was voted, remove points from card czar as punishment
        game.players = punishCardCzar(game);
        setNewTimeout = "startRound";
    }

    // @ts-ignore
    game.stateMachine[transition]();
    game.client.state = game.stateMachine.state;
    game.players = setPlayersActive(game.players);

    if (setNewTimeout != "") {
        const updatedGame = changeGameStateAfterTime(io, game, setNewTimeout);
        await setGame(updatedGame, client);
        updatePlayersIndividually(io, updatedGame);
    } else {
        await setGame(game, client);
        updatePlayersIndividually(io, game);
    }
};

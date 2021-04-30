import type * as CAH from "types";
import type * as SocketIO from "socket.io";

import { addTimeout, getTimeout, removeTimeout } from "./timeout";
import {
    appointNextCardCzar,
    setPlayersActive,
    updatePlayersIndividually,
} from "./player";
import { getGame, setGame, skipRound, startNewRound } from "./game";
import { showWhiteCard, shuffleCardsBackToDeck } from "./card";

import { PoolClient } from "pg";
import { gameOptions } from "../consts/gameSettings";
import { transactionize } from "../db/util";

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
        const cardCzar = currentCardCzar(game.players);
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
            const cardCzar = currentCardCzar(game.players);
            if (!cardCzar) return;

            game.players = appointNextCardCzar(game, cardCzar.id);
            const nextCardCzar = currentCardCzar(game.players);

            await skipRound(io, game, nextCardCzar!, client);
            return;
        }
        setNewTimeout = "showCards";
    } else if (transition === "showCards") {
        // Check if all whitecards have been showed, otherwise show next whitecards
        const cardCzar = currentCardCzar(game.players);
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

const currentCardCzar = (players: CAH.Player[]) => {
    return players.find((player) => player.isCardCzar);
};

const restartRound = async (
    io: SocketIO.Server,
    game: CAH.Game,
    client?: PoolClient
) => {
    const cardCzar = currentCardCzar(game.players);
    if (!cardCzar) return;

    game.cards.blackCards = shuffleCardsBackToDeck(
        [...game.cards.sentBlackCards],
        game.cards.blackCards
    );
    game.cards.sentBlackCards = [];

    game.players = appointNextCardCzar(game, cardCzar.id);
    const nextCardCzar = currentCardCzar(game.players);

    await skipRound(io, game, nextCardCzar!, client);
};

export const punishCardCzar = (game: CAH.Game) => {
    return game.players.map((player) => {
        if (player.isCardCzar && game.stateMachine.state !== "roundEnd") {
            player.score -= gameOptions.notSelectingWinnerPunishment;
        }
        return player;
    });
};

const getTimeoutTime = (game: CAH.Game) => {
    const timers = game.client.options.timers;
    switch (game.stateMachine.state) {
        case "pickingBlackCard":
            return timers.useSelectBlackCard
                ? timers.selectBlackCard
                : undefined;
        case "playingWhiteCards":
            return timers.useSelectWhiteCards
                ? timers.selectWhiteCards
                : undefined;
        case "readingCards":
            return timers.useReadBlackCard ? timers.readBlackCard : undefined;
        case "showingCards":
            return timers.useSelectWinner ? timers.selectWinner : undefined;
        case "roundEnd":
            return timers.useRoundEnd ? timers.roundEnd : undefined;
        default:
            return timers.selectBlackCard;
    }
};

export const getPassedTime = (id: string) => {
    const timeout = getTimeout(id);
    if (!timeout) return undefined;
    // @ts-ignore
    return process.uptime() - timeout._idleStart / 1000;
};

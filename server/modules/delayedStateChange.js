import { addTimeout, getTimeout, removeTimeout } from "./timeout.js";
import {
    appointNextCardCzar,
    setPlayersActive,
    updatePlayersIndividually,
} from "./player.js";
import { getGame, setGame, skipRound, startNewRound } from "./game.js";
import { showWhiteCard, shuffleCardsBackToDeck } from "./card.js";

import { gameOptions } from "../consts/gameSettings.js";
import { transactionize } from "../db/util.js";

export const changeGameStateAfterTime = (io, game, transition) => {
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

export const clearGameTimer = (game) => {
    removeTimeout(game.id);
    game.client.timers.duration = undefined;
    game.client.timers.passedTime = undefined;
    return game;
};

const gameStateChange = async (io, gameID, transition, client) => {
    const game = await getGame(gameID, client);
    if (!game) return;

    console.log("Handling state change to", transition);

    if (game.stateMachine.cannot(transition)) return;

    console.log("Change was legal", transition);

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
        if (game.currentRound.whiteCardsByPlayer.length === 0) {
            const cardCzar = currentCardCzar(game.players);
            if (!cardCzar) return;

            game.players = appointNextCardCzar(game, cardCzar.id);
            const nextCardCzar = currentCardCzar(game.players);

            await skipRound(io, game, nextCardCzar, client);
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

const currentCardCzar = (players) => {
    return players.find((player) => player.isCardCzar);
};

const restartRound = async (io, game, client) => {
    const cardCzar = currentCardCzar(game.players);
    if (!cardCzar) return;

    game.cards.blackCards = shuffleCardsBackToDeck(
        [...game.cards.sentBlackCards],
        game.cards.blackCards
    );
    game.cards.sentBlackCards = [];

    game.players = appointNextCardCzar(game, cardCzar.id);
    const nextCardCzar = currentCardCzar(game.players);

    await skipRound(io, game, nextCardCzar, client);
};

export const punishCardCzar = (game) => {
    return game.players.map((player) => {
        if (player.isCardCzar && game.stateMachine.state !== "roundEnd") {
            player.score -= gameOptions.notSelectingWinnerPunishment;
        }
        return player;
    });
};

const getTimeoutTime = (game) => {
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

export const getPassedTime = (id) => {
    const timeout = getTimeout(id);
    if (!timeout) return undefined;
    return process.uptime() - timeout._idleStart / 1000;
};

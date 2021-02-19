import {
    appointNextCardCzar,
    setPlayersActive,
    updatePlayersIndividually,
} from "./player.js";
import { getGame, setGame, skipRound, startNewRound } from "./game.js";
import { showWhiteCard, shuffleCardsBackToDeck } from "./card.js";

import { gameOptions } from "../consts/gameSettings.js";

export const changeGameStateAfterTime = (io, game, transition) => {
    clearTimeout(game.timeout);

    const delay = getTimeoutTime(game);
    console.log(`Setting timeout for: ${transition}, delay: ${delay}`);

    game.client.timers.duration = delay;
    game.client.timers.passedtime = 0;

    game.timeout = setTimeout(
        gameStateChange,
        (delay + gameOptions.defaultGracePeriod) * 1000,
        io,
        game.id,
        transition
    );
    return game;
};

const gameStateChange = (io, gameID, transition) => {
    const game = getGame(gameID);
    if (!game) return;

    console.log("Handling state change to", transition);

    if (game.stateMachine.cannot(transition)) return;

    console.log("Change was legal", transition);

    let setNewTimeout = "";

    if (transition === "startRound") {
        const cardCzar = currentCardCzar(game.players);
        if (!cardCzar) return;
        startNewRound(io, gameID, cardCzar.id);
        return;
    } else if (transition === "startPlayingWhiteCards") {
        // Cardczar didn't pick a blackcard, appoint next cardczar
        restartRound(io, game);
        return;
    } else if (transition === "startReading") {
        // There might not be any cards to read, in which case skip round
        if (game.currentRound.whiteCardsByPlayer.length === 0) {
            const cardCzar = currentCardCzar(game.players);
            if (!cardCzar) return;

            game.players = appointNextCardCzar(game, cardCzar.id);
            const nextCardCzar = currentCardCzar(game.players);

            skipRound(io, game, nextCardCzar);
            return;
        }
        setNewTimeout = "showCards";
    } else if (transition === "showCards") {
        // Check if all whitecards have been showed, otherwise show next whitecards
        const cardCzar = currentCardCzar(game.players);
        if (!cardCzar) return;
        showWhiteCard(io, gameID, cardCzar.id);
        return;
    } else if (transition === "endRound") {
        // Nothing was voted, remove points from card czar as punishment
        game.players = punishCardCzar(game.players);
    }

    game.stateMachine[transition]();
    game.client.state = game.stateMachine.state;
    game.players = setPlayersActive(game.players);

    if (setNewTimeout != "") {
        const updatedGame = changeGameStateAfterTime(io, game, setNewTimeout);
        setGame(updatedGame);
        updatePlayersIndividually(io, updatedGame);
    } else {
        updatePlayersIndividually(io, game);
        setGame(game);
    }
};

const currentCardCzar = (players) => {
    return players.find((player) => player.isCardCzar);
};

const restartRound = (io, game) => {
    const cardCzar = currentCardCzar(game.players);
    if (!cardCzar) return;

    game.cards.blackCards = shuffleCardsBackToDeck(
        [...game.cards.sentBlackCards],
        game.cards.blackCards
    );
    game.cards.sentBlackCards = [];

    game.players = appointNextCardCzar(game, cardCzar.id);
    const nextCardCzar = currentCardCzar(game.players);

    skipRound(io, game, nextCardCzar);
};

const punishCardCzar = (players) => {
    return players.map((player) => {
        if (player.isCardCzar) {
            player.score -= gameOptions.notSelectingWinnerPunishment;
        }
        return player;
    });
};

const getTimeoutTime = (game) => {
    const timers = game.client.options.timers;
    switch (game.stateMachine.state) {
        case "pickingBlackCard":
            return timers.selectBlackCard;
        case "playingWhiteCards":
            return timers.selectWhiteCards;
        case "readingCards":
            return timers.readBlackCard;
        case "showingCards":
            return timers.selectWinner;
        case "roundEnd":
            return timers.roundEnd;
        default:
            return timers.selectBlackCard;
    }
};

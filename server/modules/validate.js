import { gameOptions, playerName } from "../consts/gameSettings.js";

import { clamp } from "./util.js";
import { getPlayer } from "./player.js";

export const validateHost = (game, playerID) => {
    return game.players.find(
        (player) => player.id === playerID && player.isHost
    );
};

export const validateCardCzar = (game, playerID) => {
    return game.players.find(
        (player) => player.id === playerID && player.isCardCzar
    );
};

export const validateRoundCardCzar = (game, playerID) => {
    return game.currentRound.cardCzar === playerID;
};

export const validatePlayerPlayingWhiteCards = (
    game,
    playerID,
    whiteCardIDs
) => {
    if (!validateState(game, "playingWhiteCards")) {
        return {
            error: "Tällä hetkellä ei voi pelata valkoisia kortteja",
        };
    }

    const player = getPlayer(game, playerID);
    if (player === undefined) {
        return {
            result: false,
            error: "Pelaajaa ei löytynyt",
        };
    }
    if (!validatePlayerState(player, "playing")) {
        return {
            result: false,
            error: "Player is in wrong state",
        };
    }

    if (validateCardCzar(game, playerID))
        return {
            error:
                "Pelaaja on card czar, eikä siksi voi pelata valkoisia kortteja",
        };

    if (
        player.whiteCards.filter((whiteCard) =>
            whiteCardIDs.includes(whiteCard.id)
        ).length !== whiteCardIDs.length
    ) {
        return {
            result: false,
            error: "Pelaajalla ei ole kortteja",
        };
    }

    return {
        result: true,
    };
};

export const validateOptions = (newOptions) => {
    validateTimers(newOptions.timers);
    const validatedOptions = {
        ...newOptions,
        maximumPlayers: clamp(
            newOptions.maximumPlayers,
            gameOptions.minimumPlayers,
            gameOptions.maximumPlayers
        ),
        winConditions: {
            scoreLimit: clamp(
                newOptions.winConditions.scoreLimit,
                gameOptions.winConditions.scoreLimit.minimum,
                gameOptions.winConditions.scoreLimit.maximum
            ),
            useScoreLimit: !!newOptions.winConditions.useScoreLimit,
            roundLimit: clamp(
                newOptions.winConditions.roundLimit,
                gameOptions.winConditions.roundLimit.minimum,
                gameOptions.winConditions.roundLimit.maximum
            ),
            useRoundLimit: !!newOptions.winConditions.useRoundLimit,
        },

        timers: validateTimers(newOptions.timers),

        winnerBecomesCardCzar: !!newOptions.winnerBecomesCardCzar,
        allowKickedPlayerJoin: !!newOptions.allowKickedPlayerJoin,
    };
    return validatedOptions;
};

const validateTimers = (timers) => {
    const keys = [
        ...Object.keys(gameOptions.timers),
        "useSelectBlackCard",
        "useSelectWhiteCards",
        "useReadBlackCard",
        "useSelectWinner",
        "useRoundEnd",
    ];
    let newTimers = {};

    for (const [key, value] of Object.entries(timers)) {
        if (!keys.includes(key)) continue;

        if (typeof value === "number") {
            newTimers[key] = clamp(
                value,
                gameOptions.timers[key].minimum,
                gameOptions.timers[key].maximum
            );
        } else {
            newTimers[key] = !!value;
        }
    }
    return newTimers;
};

export const validateGameStartRequirements = (game) => {
    if (!validateState(game, "lobby")) {
        return {
            result: false,
            error: "Not in lobby",
        };
    }
    const activePlayerCount = game.players.filter(
        (player) => player.state === "active"
    ).length;
    if (activePlayerCount < gameOptions.minimumPlayers)
        return {
            result: false,
            error: `Ei tarpeeksi pelaajia, tarvitaan vähintään ${gameOptions.minimumPlayers}`,
        };
    if (
        activePlayerCount > game.client.options.maximumPlayers ||
        activePlayerCount > gameOptions.maximumPlayers
    )
        return {
            result: false,
            error: "Liikaa pelaajia",
        };

    if (
        game.cards.whiteCards.length <
        gameOptions.startingWhiteCardCount * activePlayerCount
    ) {
        return {
            result: false,
            error: "Ei tarpeeksi valkoisia kortteja",
        };
    }
    if (game.cards.blackCards.length < gameOptions.blackCardsToChooseFrom) {
        return {
            result: false,
            error: "Ei tarpeeksi mustia kortteja",
        };
    }

    return {
        result: true,
    };
};

export const validateShowingWhiteCard = (game, playerID) => {
    if (!validateCardCzar(game, playerID))
        return {
            error: "Pelaaja ei ole Card Czar",
        };
    if (!validateState(game, "readingCards"))
        return {
            error: "Väärä pelinvaihe",
        };
    return {
        result: true,
    };
};

export const validatePickingWinner = (game, playerID, whiteCardIDs) => {
    if (!validateCardCzar(game, playerID)) {
        return { error: "Ei ole cardczar" };
    } else if (!validateState(game, "showingCards")) {
        return { error: "Väärä pelinvaihe" };
    } else {
        return { result: true };
    }
};

export const validatePopularVote = (game, playerID) => {
    if (!game.client.options.allowCardCzarPopularVote) {
        if (validateCardCzar(game, playerID))
            return { error: "Cardczar ei saa äänestää " };
    }
    if (!validateState(game, ["readingCards", "showingCards", "roundEnd"])) {
        return { error: "Tässä pelinvaiheessa ei voi äänestää" };
    }
    return { result: true };
};

export const validateGameEnding = (game) => {
    let gameOver = false;
    if (game.client.options.winConditions.useScoreLimit) {
        const highestScore = game.players.reduce(
            (prev, current) => (prev.score > current.score ? prev : current),
            { score: 0 }
        );
        gameOver =
            gameOver ||
            highestScore.score >= game.client.options.winConditions.scoreLimit;
    }

    if (game.client.options.winConditions.useRoundLimit) {
        gameOver =
            gameOver ||
            game.client.rounds.length >=
                game.client.options.winConditions.roundLimit;
    }

    return gameOver;
};

export const validateState = (game, states) => {
    if (Array.isArray(states)) {
        return states.includes(game.stateMachine.state);
    } else {
        return game.stateMachine?.state === states;
    }
};

export const validatePlayerState = (player, states) => {
    if (Array.isArray(states)) {
        return states.includes(player.state);
    } else {
        return player.state === states;
    }
};

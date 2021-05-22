"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePlayerState = exports.validateState = exports.validateGameEnding = exports.validatePopularVote = exports.validatePickingWinner = exports.validateShowingWhiteCard = exports.validateGameStartRequirements = exports.validateOptions = exports.validatePlayerPlayingWhiteCards = exports.validateRoundCardCzar = exports.validateCardCzar = exports.validateHost = void 0;
const error_1 = require("../../consts/error");
const mathUtil_1 = require("./mathUtil");
const playerUtil_1 = require("../players/playerUtil");
const gameSettings_1 = require("../../consts/gameSettings");
const sanitize_1 = require("./sanitize");
const validateHost = (game, playerID) => {
    return game.players.find((player) => player.id === playerID && player.isHost);
};
exports.validateHost = validateHost;
const validateCardCzar = (game, playerID) => {
    return game.players.find((player) => player.id === playerID && player.isCardCzar);
};
exports.validateCardCzar = validateCardCzar;
const validateRoundCardCzar = (game, playerID) => {
    return game.currentRound?.cardCzar === playerID;
};
exports.validateRoundCardCzar = validateRoundCardCzar;
const validatePlayerPlayingWhiteCards = (game, playerID, whiteCardIDs) => {
    if (!exports.validateState(game, "playingWhiteCards")) {
        return {
            error: error_1.ERROR_TYPES.incorrectGameState,
        };
    }
    const player = playerUtil_1.findPlayer(game.players, playerID);
    if (player === undefined) {
        return {
            result: false,
            error: error_1.ERROR_TYPES.otherError,
        };
    }
    if (!exports.validatePlayerState(player, "playing")) {
        return {
            result: false,
            error: error_1.ERROR_TYPES.otherError,
        };
    }
    if (exports.validateCardCzar(game, playerID))
        return {
            error: error_1.ERROR_TYPES.forbiddenPlayerAction,
        };
    if (player.whiteCards.filter((whiteCard) => whiteCardIDs.includes(whiteCard.id)).length !== whiteCardIDs.length) {
        return {
            result: false,
            error: error_1.ERROR_TYPES.otherError,
        };
    }
    return {
        result: true,
    };
};
exports.validatePlayerPlayingWhiteCards = validatePlayerPlayingWhiteCards;
const validateOptions = (newOptions) => {
    let password = undefined;
    if (newOptions.password) {
        password = sanitize_1.sanitizeString(newOptions.password);
    }
    const validatedOptions = {
        ...newOptions,
        maximumPlayers: mathUtil_1.clamp(newOptions.maximumPlayers, gameSettings_1.gameOptions.minimumPlayers, gameSettings_1.gameOptions.maximumPlayers),
        winConditions: {
            scoreLimit: mathUtil_1.clamp(newOptions.winConditions.scoreLimit, gameSettings_1.gameOptions.winConditions.scoreLimit.minimum, gameSettings_1.gameOptions.winConditions.scoreLimit.maximum),
            useScoreLimit: !!newOptions.winConditions.useScoreLimit,
            roundLimit: mathUtil_1.clamp(newOptions.winConditions.roundLimit, gameSettings_1.gameOptions.winConditions.roundLimit.minimum, gameSettings_1.gameOptions.winConditions.roundLimit.maximum),
            useRoundLimit: !!newOptions.winConditions.useRoundLimit,
        },
        timers: validateTimers(newOptions.timers),
        winnerBecomesCardCzar: !!newOptions.winnerBecomesCardCzar,
        allowKickedPlayerJoin: !!newOptions.allowKickedPlayerJoin,
        password: password,
    };
    return validatedOptions;
};
exports.validateOptions = validateOptions;
const validateTimers = (timers) => {
    const keys = [
        ...Object.keys(gameSettings_1.gameOptions.timers),
        "useSelectBlackCard",
        "useSelectWhiteCards",
        "useReadBlackCard",
        "useSelectWinner",
        "useRoundEnd",
    ];
    let newTimers = {};
    for (const [key, value] of Object.entries(timers)) {
        if (!keys.includes(key))
            continue;
        if (typeof value === "number") {
            newTimers[key] = mathUtil_1.clamp(value, gameSettings_1.gameOptions.timers[key].minimum, gameSettings_1.gameOptions.timers[key].maximum);
        }
        else {
            newTimers[key] = !!value;
        }
    }
    return newTimers;
};
const validateGameStartRequirements = (game) => {
    if (!exports.validateState(game, "lobby")) {
        return {
            result: false,
            error: error_1.ERROR_TYPES.incorrectGameState,
        };
    }
    const activePlayerCount = game.players.filter((player) => player.state === "active").length;
    if (activePlayerCount < gameSettings_1.gameOptions.minimumPlayers)
        return {
            result: false,
            error: error_1.ERROR_TYPES.notEnoughPlayers,
        };
    if (activePlayerCount > game.client.options.maximumPlayers ||
        activePlayerCount > gameSettings_1.gameOptions.maximumPlayers)
        return {
            result: false,
            error: error_1.ERROR_TYPES.tooManyPlayers,
        };
    if (game.cards.whiteCards.length <
        gameSettings_1.gameOptions.startingWhiteCardCount * activePlayerCount) {
        return {
            result: false,
            error: error_1.ERROR_TYPES.notEnoughWhiteCards,
        };
    }
    if (game.cards.blackCards.length < gameSettings_1.gameOptions.blackCardsToChooseFrom) {
        return {
            result: false,
            error: error_1.ERROR_TYPES.notEnoughBlackCards,
        };
    }
    return {
        result: true,
    };
};
exports.validateGameStartRequirements = validateGameStartRequirements;
const validateShowingWhiteCard = (game, playerID) => {
    if (!exports.validateCardCzar(game, playerID))
        return {
            error: error_1.ERROR_TYPES.forbiddenCardCzarAction,
        };
    if (!exports.validateState(game, "readingCards"))
        return {
            error: error_1.ERROR_TYPES.incorrectGameState,
        };
    return {
        result: true,
    };
};
exports.validateShowingWhiteCard = validateShowingWhiteCard;
const validatePickingWinner = (game, playerID) => {
    if (!exports.validateCardCzar(game, playerID)) {
        return { error: error_1.ERROR_TYPES.forbiddenCardCzarAction };
    }
    else if (!exports.validateState(game, "showingCards")) {
        return { error: error_1.ERROR_TYPES.incorrectGameState };
    }
    else {
        return { result: true };
    }
};
exports.validatePickingWinner = validatePickingWinner;
const validatePopularVote = (game, playerID) => {
    if (!game.client.options.allowCardCzarPopularVote) {
        if (exports.validateCardCzar(game, playerID))
            return { error: error_1.ERROR_TYPES.forbiddenPlayerAction };
    }
    if (!exports.validateState(game, ["readingCards", "showingCards", "roundEnd"])) {
        return { error: error_1.ERROR_TYPES.incorrectGameState };
    }
    return { result: true };
};
exports.validatePopularVote = validatePopularVote;
const validateGameEnding = (game) => {
    let gameOver = false;
    if (game.client.options.winConditions.useScoreLimit) {
        const highestScore = game.players.reduce((prev, current) => (prev.score > current.score ? prev : current), { score: 0 });
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
exports.validateGameEnding = validateGameEnding;
const validateState = (game, states) => {
    if (Array.isArray(states)) {
        return states.includes(game.stateMachine.state);
    }
    else {
        return game.stateMachine?.state === states;
    }
};
exports.validateState = validateState;
const validatePlayerState = (player, states) => {
    if (Array.isArray(states)) {
        return states.includes(player.state);
    }
    else {
        return player.state === states;
    }
};
exports.validatePlayerState = validatePlayerState;

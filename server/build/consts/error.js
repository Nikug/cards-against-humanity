"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NOTIFICATION_TIME = exports.NOTIFICATION_TYPES = exports.ERROR_TYPES = void 0;
exports.ERROR_TYPES = {
    // Actions
    forbiddenCardCzarAction: "forbiddenCardCzarAction",
    forbiddenHostAction: "forbiddenHostAction",
    forbiddenPlayerAction: "forbiddenPlayerAction",
    incorrectGameState: "incorrectGameState",
    // Joining game
    lobbyIsFullJoinAsSpectator: "lobbyIsFullJoinAsSpectator",
    lobbyAndSpectatorsAreFull: "lobbyAndSpectatorsAreFull",
    spectatorsAreFull: "spectatorsAreFull",
    playersAreFull: "playersAreFull",
    gameWasNotFound: "gameWasNotFound",
    joinedToDifferentGame: "joinedToDifferentGame",
    // Invalid socket message
    invalidSocketMessage: "invalidSocketMessage",
    missingFields: "missingFields",
    // Starting game
    notEnoughPlayers: "notEnoughPlayers",
    tooManyPlayers: "tooManyPlayers",
    notEnoughBlackCards: "notEnoughBlackCards",
    notEnoughWhiteCards: "notEnoughWhiteCards",
    // General
    otherError: "otherError",
    cardPackWasNotFound: "cardPackWasNotFound",
    promotedToHost: "promotedToHost",
    kickedByHost: "kickedByHost",
    movedToSpectators: "movedToSpectators",
    couldntCreateGame: "couldntCreateGame",
};
exports.NOTIFICATION_TYPES = {
    default: "default",
    error: "error",
    success: "success",
};
exports.NOTIFICATION_TIME = 5000; // 5 seconds

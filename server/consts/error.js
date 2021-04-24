export const ERROR_TYPES = {
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

export const NOTIFICATION_TYPES = {
    default: "default",
    error: "error",
    success: "success",
};

export const NOTIFICATION_TIME = 5000; // 5 seconds

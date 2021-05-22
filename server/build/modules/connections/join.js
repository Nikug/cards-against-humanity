"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJoiningPlayerState = exports.joinGame = void 0;
const error_1 = require("../../consts/error");
const gameSettings_1 = require("../../consts/gameSettings");
const playerUtil_1 = require("../players/playerUtil");
const gameOptions_1 = require("../games/gameOptions");
const gameUtil_1 = require("../games/gameUtil");
const createPlayer_1 = require("../players/createPlayer");
const states_1 = require("../../consts/states");
const sanitize_1 = require("../utilities/sanitize");
const socket_1 = require("../utilities/socket");
const emitPlayers_1 = require("../players/emitPlayers");
const joinGame = async (io, socket, gameID, playerID, password, client) => {
    console.log(`Joining game! gameID: ${gameID} playerID: ${playerID}`);
    if (!!playerID) {
        const game = await gameUtil_1.findGameByPlayerID(playerID, client);
        if (!!game) {
            if (!!gameID) {
                if (gameID === game.id) {
                    addPlayerToGame(io, socket, gameID, playerID, password, client);
                }
                else {
                    // Join the game but send also warning about joining a different game than expected
                    addPlayerToGame(io, socket, game.id, playerID, password, client);
                    socket_1.sendNotification(error_1.ERROR_TYPES.joinedToDifferentGame, error_1.NOTIFICATION_TYPES.default, { socket: socket });
                }
            }
            else {
                addPlayerToGame(io, socket, game.id, playerID, password, client);
            }
        }
        else {
            handleGameID(io, socket, gameID, password, client);
        }
    }
    else {
        handleGameID(io, socket, gameID, password, client);
    }
};
exports.joinGame = joinGame;
const handleGameID = async (io, socket, gameID, password, client) => {
    if (!!gameID) {
        const game = await gameUtil_1.getGame(gameID, client);
        if (!!game) {
            addPlayerToGame(io, socket, gameID, undefined, password, client);
        }
        else {
            // Can't find a game with the id, return error
            returnError(socket);
            socket.disconnect(true);
            return;
        }
    }
    else {
        // No game id, return error about bad query
        // TODO: fix this hack for removing player cookie
        console.log("DOing the hack");
        socket.emit("update_game_and_players", { data: { game: null } });
        returnError(socket);
        socket.disconnect(true);
        return;
    }
};
const addPlayerToGame = async (io, socket, gameID, playerID, password, client) => {
    const game = await gameUtil_1.getGame(gameID, client);
    if (!game)
        return;
    if (game.client.options.password) {
        const match = handlePassword(game.client.options.password, password);
        if (!match) {
            socket.send("join_game", { password: false });
            return;
        }
    }
    const isHost = game.players.length === 0;
    const player = playerUtil_1.findPlayer(game.players, playerID);
    if (!player) {
        if (gameOptions_1.checkPlayerLimit(game)) {
            const newPlayer = createPlayer_1.createNewPlayer(socket.id, isHost);
            game.players = playerUtil_1.addPlayer(game.players, newPlayer);
        }
        else if (gameOptions_1.checkSpectatorLimit(game)) {
            socket_1.sendNotification(error_1.ERROR_TYPES.lobbyIsFullJoinAsSpectator, error_1.NOTIFICATION_TYPES.default, { socket: socket });
            const newPlayer = createPlayer_1.createNewPlayer(socket.id, isHost, "spectating");
            game.players = playerUtil_1.addPlayer(game.players, newPlayer);
        }
        else {
            socket_1.sendNotification(error_1.ERROR_TYPES.lobbyAndSpectatorsAreFull, error_1.NOTIFICATION_TYPES.default, { socket: socket });
            socket.disconnect();
            return;
        }
    }
    else {
        if (player.sockets.length === 0) {
            if (player.name.length >= gameSettings_1.playerName.minimumLength) {
                player.state =
                    game.stateMachine.state === "lobby" ? "active" : "joining";
            }
            else {
                player.state = "pickingName";
            }
        }
        player.sockets = [...player.sockets, socket.id];
        game.players = playerUtil_1.setPlayer(game.players, player);
    }
    socket.join(gameID);
    await gameUtil_1.setGame(game, client);
    emitPlayers_1.updatePlayersIndividually(io, game);
};
const getJoiningPlayerState = (gameState, hasName) => {
    if (gameState === "lobby" && hasName) {
        return "active";
    }
    else {
        return states_1.joiningPlayerStates[gameState];
    }
};
exports.getJoiningPlayerState = getJoiningPlayerState;
const returnError = (socket) => {
    socket_1.sendNotification(error_1.ERROR_TYPES.gameWasNotFound, error_1.NOTIFICATION_TYPES.error, {
        socket: socket,
    });
};
const handlePassword = (gamePassword, playerPassword) => {
    if (!playerPassword)
        return false;
    const cleanPlayerPassword = sanitize_1.sanitizeString(playerPassword, gameSettings_1.Password.maximumLength);
    return cleanPlayerPassword === gamePassword;
};

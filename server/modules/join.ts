import type * as CAH from "types";
import type * as SocketIO from "socket.io";

import { ERROR_TYPES, NOTIFICATION_TYPES } from "../consts/error";
import { createNewPlayer, updatePlayersIndividually } from "./player";
import { findGameByPlayerID, getGame, setGame } from "./game";
import { gameOptions, playerName } from "../consts/gameSettings";

import { PoolClient } from "pg";
import { sendNotification } from "./socket";

export const joinGame = async (
    io: SocketIO.Server,
    socket: SocketIO.Socket,
    gameID: string,
    playerID: string,
    client?: PoolClient
) => {
    console.log(`Joining game! gameID: ${gameID} playerID: ${playerID}`);
    if (!!playerID) {
        const game = await findGameByPlayerID(playerID, client);
        if (!!game) {
            if (!!gameID) {
                if (gameID === game.id) {
                    addPlayerToGame(io, socket, gameID, playerID, client);
                } else {
                    // Join the game but send also warning about joining a different game than expected
                    addPlayerToGame(io, socket, game.id, playerID, client);
                    sendNotification(
                        ERROR_TYPES.joinedToDifferentGame,
                        NOTIFICATION_TYPES.default,
                        { socket: socket }
                    );
                }
            } else {
                addPlayerToGame(io, socket, game.id, playerID, client);
            }
        } else {
            handleGameID(io, socket, gameID, client);
        }
    } else {
        handleGameID(io, socket, gameID, client);
    }
};

const handleGameID = async (
    io: SocketIO.Server,
    socket: SocketIO.Socket,
    gameID: string,
    client?: PoolClient
) => {
    if (!!gameID) {
        const game = await getGame(gameID, client);
        if (!!game) {
            addPlayerToGame(io, socket, gameID, null, client);
        } else {
            // Can't find a game with the id, return error
            returnError(socket);
            socket.disconnect(true);
            return;
        }
    } else {
        // No game id, return error about bad query

        // TODO: fix this hack for removing player cookie
        console.log("DOing the hack");
        socket.emit("update_game_and_players", { data: { game: null } });

        returnError(socket);
        socket.disconnect(true);
        return;
    }
};

const addPlayerToGame = async (
    io: SocketIO.Server,
    socket: SocketIO.Socket,
    gameID: string,
    playerID: string | null,
    client?: PoolClient
) => {
    const game = await getGame(gameID, client);
    if (!game) return;

    const isHost = game.players.length === 0;
    const player = findPlayer(game.players, playerID);

    if (!player) {
        if (checkPlayerLimit(game)) {
            const newPlayer = createNewPlayer(socket.id, isHost);
            game.players = addPlayer(game.players, newPlayer);
        } else if (checkSpectatorLimit(game)) {
            sendNotification(
                ERROR_TYPES.lobbyIsFullJoinAsSpectator,
                NOTIFICATION_TYPES.default,
                { socket: socket }
            );
            const newPlayer = createNewPlayer(socket.id, isHost, "spectating");
            game.players = addPlayer(game.players, newPlayer);
        } else {
            sendNotification(
                ERROR_TYPES.lobbyAndSpectatorsAreFull,
                NOTIFICATION_TYPES.default,
                { socket: socket }
            );
            socket.disconnect();
            return;
        }
    } else {
        if (player.sockets.length === 0) {
            if (player.name.length >= playerName.minimumLength) {
                player.state =
                    game.stateMachine.state === "lobby" ? "active" : "joining";
            } else {
                player.state = "pickingName";
            }
        }

        player.sockets = [...player.sockets, socket.id];
        game.players = setPlayer(game.players, player);
    }
    socket.join(gameID);
    await setGame(game, client);
    updatePlayersIndividually(io, game);
};

const findPlayer = (players: CAH.Player[], playerID: string | null) => {
    return players.find((player) => player.id === playerID);
};

const addPlayer = (players: CAH.Player[], player: CAH.Player) => {
    return [...players, player];
};

export const setPlayer = (players: CAH.Player[], newPlayer: CAH.Player) => {
    return players.map((player) =>
        player.id === newPlayer.id ? newPlayer : player
    );
};

const returnError = (socket: SocketIO.Socket) => {
    sendNotification(ERROR_TYPES.gameWasNotFound, NOTIFICATION_TYPES.error, {
        socket: socket,
    });
};

export const checkPlayerLimit = (game: CAH.Game) => {
    const nonSpectators = game.players.filter(
        (player) => player.state !== "spectating"
    );
    return game.client.options.maximumPlayers > nonSpectators.length;
};

export const checkSpectatorLimit = (game: CAH.Game) => {
    const spectators = game.players.filter(
        (player) => player.state === "spectating"
    );
    return gameOptions.spectatorLimit > spectators.length;
};

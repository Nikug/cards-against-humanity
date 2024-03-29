import type * as CAH from "types";
import type * as SocketIO from "socket.io";

import { ERROR_TYPES, NOTIFICATION_TYPES } from "../../consts/error";
import { Password, playerName } from "../../consts/gameSettings";
import { addPlayer, findPlayer, setPlayer } from "../players/playerUtil";
import { checkPlayerLimit, checkSpectatorLimit } from "../games/gameOptions";
import { findGameByPlayerID, getGame, setGame } from "../games/gameUtil";

import { PoolClient } from "pg";
import { createNewPlayer } from "../players/createPlayer";
import { joiningPlayerStates } from "../../consts/states";
import { sanitizeString } from "../utilities/sanitize";
import { sendNotification } from "../utilities/socket";
import { updatePlayersIndividually } from "../players/emitPlayers";

export const joinGame = async (
    io: SocketIO.Server,
    socket: SocketIO.Socket,
    gameID: string | undefined,
    playerID: string | undefined,
    password: string | undefined,
    client?: PoolClient
) => {
    console.log(`Joining game! gameID: ${gameID} playerID: ${playerID}`);
    if (!!playerID) {
        const game = await findGameByPlayerID(playerID, client);
        if (!!game) {
            if (!!gameID) {
                if (gameID === game.id) {
                    await addPlayerToGame(
                        io,
                        socket,
                        gameID,
                        playerID,
                        password,
                        client
                    );
                } else {
                    // Join the game but send also warning about joining a different game than expected
                    await addPlayerToGame(
                        io,
                        socket,
                        game.id,
                        playerID,
                        password,
                        client
                    );
                    sendNotification(
                        ERROR_TYPES.joinedToDifferentGame,
                        NOTIFICATION_TYPES.default,
                        { socket: socket }
                    );
                }
            } else {
                await addPlayerToGame(
                    io,
                    socket,
                    game.id,
                    playerID,
                    password,
                    client
                );
            }
        } else {
            await handleGameID(io, socket, gameID, password, client);
        }
    } else {
        await handleGameID(io, socket, gameID, password, client);
    }
};

const handleGameID = async (
    io: SocketIO.Server,
    socket: SocketIO.Socket,
    gameID: string | undefined,
    password: string | undefined,
    client?: PoolClient
) => {
    if (!!gameID) {
        const game = await getGame(gameID, client);
        if (!!game) {
            await addPlayerToGame(
                io,
                socket,
                gameID,
                undefined,
                password,
                client
            );
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
    playerID: string | undefined,
    password: string | undefined,
    client?: PoolClient
) => {
    const game = await getGame(gameID, client);
    if (!game) return;

    if (game.client.options.password) {
        const match = handlePassword(game.client.options.password, password);
        if (!match) {
            socket.emit("join_game", { password: false });
            return;
        }
    }

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
            socket.disconnect(true);
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

export const getJoiningPlayerState = (
    gameState: CAH.GameState,
    hasName: boolean
) => {
    if (gameState === "lobby" && hasName) {
        return "active";
    } else {
        return joiningPlayerStates[gameState];
    }
};

const returnError = (socket: SocketIO.Socket) => {
    sendNotification(ERROR_TYPES.gameWasNotFound, NOTIFICATION_TYPES.error, {
        socket: socket,
    });
};

const handlePassword = (
    gamePassword: string,
    playerPassword: string | undefined
): boolean => {
    if (!playerPassword) return false;
    const cleanPlayerPassword = sanitizeString(
        playerPassword,
        Password.maximumLength
    );
    return cleanPlayerPassword === gamePassword;
};

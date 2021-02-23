import { createNewPlayer, updatePlayersIndividually } from "./player.js";
import { findGameByPlayerID, getGame, setGame } from "./game.js";
import { gameOptions, playerName } from "../consts/gameSettings.js";

export const joinGame = (io, socket, gameID, playerID) => {
    console.log(`Joining game! gameID: ${gameID} playerID: ${playerID}`);
    if (!!playerID) {
        const game = findGameByPlayerID(playerID);
        if (!!game) {
            if (!!gameID) {
                if (gameID === game.id) {
                    console.log("Joining with gameID and playerID");
                    addPlayerToGame(io, socket, gameID, playerID);
                } else {
                    // Join the game but send also warning about joining a different game than expected
                    console.log(
                        "Joining with gameID and playerID, but different game was found"
                    );
                    addPlayerToGame(io, socket, game.id, playerID);
                }
            } else {
                console.log("Joining with playerID and no gameID");
                addPlayerToGame(io, socket, game.id, playerID);
            }
        } else {
            handleGameID(io, socket, gameID);
        }
    } else {
        handleGameID(io, socket, gameID);
    }
};

const handleGameID = (io, socket, gameID) => {
    if (!!gameID) {
        const game = getGame(gameID);
        if (!!game) {
            console.log("Joining with just a gameID");
            addPlayerToGame(io, socket, gameID, null);
        } else {
            // Can't find a game with the id, return error
            console.log("Tried to join with just a gameID that was incorrect");
            returnError(socket);
            socket.disconnect();
            return;
        }
    } else {
        // No game id, return error about bad query
        console.log("No gameID, no playerID, returning");
        returnError(socket);
        socket.disconnect();
        return;
    }
};

const addPlayerToGame = (io, socket, gameID, playerID) => {
    const game = getGame(gameID);
    if (!game) return;

    const isHost = game.players.length === 0;
    const player = findPlayer(game.players, playerID);

    if (!player) {
        if (checkPlayerLimit(game)) {
            console.log("Adding new player!");
            const newPlayer = createNewPlayer(socket.id, isHost);
            game.players = addPlayer(game.players, newPlayer);
        } else if (checkSpectatorLimit(game)) {
            console.log("Adding new spectator!");
            const newPlayer = createNewPlayer(socket.id, isHost, "spectating");
            game.players = addPlayer(game.players, newPlayer);
        } else {
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
    setGame(game);
    updatePlayersIndividually(io, game);
};

const findPlayer = (players, playerID) => {
    return players.find((player) => player.id === playerID);
};

const addPlayer = (players, player) => {
    return [...players, player];
};

export const setPlayer = (players, newPlayer) => {
    return players.map((player) =>
        player.id === newPlayer.id ? newPlayer : player
    );
};

const returnError = (socket) => {
    socket.emit("update_game_and_players", { error: "No game found" });
};

const checkPlayerLimit = (game) => {
    const nonSpectators = game.players.filter(
        (player) => player.state !== "spectating"
    );
    return game.client.options.maximumPlayers > nonSpectators.length;
};

const checkSpectatorLimit = (game) => {
    const spectators = game.players.filter(
        (player) => player.state === "spectating"
    );
    return gameOptions.spectatorLimit > spectators;
};

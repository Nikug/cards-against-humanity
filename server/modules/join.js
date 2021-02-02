import { gameOptions } from "../consts/gameSettings.js";
import { findGameByPlayerID, getGame, setGame } from "./game.js";
import { createNewPlayer, updatePlayersIndividually } from "./player.js";

export const joinGame = (io, socket, gameID, playerID) => {
    if (!!playerID) {
        const game = findGameByPlayerID(playerID);
        if (!!game) {
            if (!!gameID) {
                if (gameID === game.id) {
                    addPlayerToGame(io, socket, gameID, playerID);
                } else {
                    // Join the game but send also warning about joining a different game than expected
                    addPlayerToGame(io, socket, game.id, playerID);
                }
            } else {
                addPlayerToGame(io, socket, game.id, playerID);
            }
        } else {
            // Can't find player, no gameID, return error
        }
    } else {
        handleGameID(io, socket, gameID);
    }
};

const handleGameID = (io, socket, gameID) => {
    if (!!gameID) {
        const game = getGame(gameID);
        if (!!game) {
            addPlayerToGame(io, socket, gameID, null);
        } else {
            // Can't find a game with the id, return error
            return;
        }
    } else {
        // No game id, return error about bad query
        return;
    }
};

const addPlayerToGame = (io, socket, gameID, playerID) => {
    const game = getGame(gameID);
    if (!game) return;

    const isHost = game.players.length === 0;
    const player = findPlayer(game.players, playerID);
    if (!player) {
        const newPlayer = createNewPlayer(socket.id, isHost);
        game.players = addPlayer(game.players, newPlayer);
    } else {
        if (player.name.length >= playerName.minimumLength) {
            player.state =
                game.stateMachine.state === "lobby" ? "active" : "joining";
        } else {
            player.state = "pickingName";
        }
        player.socket = socket.id;
        game.players = setPlayer(game.players, player);
    }
    setGame(game);
    updatePlayersIndividually(io, game);
};

const findPlayer = (players, playerID) => {
    return players.find((player) => player.id === playerID);
};

const addPlayer = (players, player) => {
    return [...players, player];
};

const setPlayer = (players, newPlayer) => {
    return players.map((player) =>
        player.id === newPlayer.id ? newPlayer : player
    );
};

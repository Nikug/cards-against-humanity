import { nanoid } from "nanoid";
import sanitize from "sanitize";
const sanitizer = sanitize();

import {
    findGameAndPlayerBySocketID,
    getGame,
    removeGame,
    removeGameIfNoActivePlayers,
    returnToLobby,
    setGame,
    shouldGameBeDeleted,
    shouldReturnToLobby,
    skipRound,
} from "./game.js";
import {
    INACTIVE_GAME_DELETE_TIME,
    playerName,
    gameOptions,
} from "../consts/gameSettings.js";
import { anonymizedGameClient, drawWhiteCards } from "./card.js";
import { joiningPlayerStates } from "../consts/states.js";

export const updatePlayerName = (io, gameID, playerID, newName) => {
    const game = getGame(gameID);
    if (!game) return;

    const trimmedName = newName.trim();
    if (trimmedName.length < playerName.minimumLength) return;

    const shortenedName = trimmedName.substr(0, playerName.maximumLength);
    const cleanName = sanitizer.value(shortenedName, "str");

    const player = getPlayer(game, playerID);

    if (player.state === "pickingName") {
        player.state =
            game.stateMachine.state === "lobby" ? "active" : "joining";
    }
    const newGame = setPlayerName(game, player, cleanName);
    setGame(newGame);

    updatePlayersIndividually(io, newGame);
};

export const setPlayerName = (game, newPlayer, newName) => {
    if (game) {
        game.players = game.players.map((player) => {
            return player.id === newPlayer.id
                ? { ...newPlayer, name: newName }
                : player;
        });
        return game;
    }
};

export const changePlayerTextToSpeech = (io, gameID, playerID, useTTS) => {
    const game = getGame(gameID);
    if (!game) return;

    const player = getPlayer(game, playerID);
    if (!player) return;

    player.useTextToSpeech = !!useTTS;
    game.players = game.players.map((gamePlayer) =>
        gamePlayer.id === player.id ? player : gamePlayer
    );
    setGame(game);

    updatePlayersIndividually(io, game);
};

export const createNewPlayer = (socketID, isHost, state = "pickingName") => {
    const player = {
        id: nanoid(),
        socket: socketID,
        name: "",
        state: state,
        score: 0,
        isCardCzar: false,
        isHost: isHost,
        popularVoteScore: 0,
        whiteCards: [],
        useTextToSpeech: false,
    };
    return player;
};

export const publicPlayersObject = (players) => {
    return players?.map((player) => {
        const { id, socket, whiteCards, popularVoteScore, ...rest } = player;
        return rest;
    });
};

export const setPlayersPlaying = (players) => {
    return players.map((player) =>
        player.state === "active" ? { ...player, state: "playing" } : player
    );
};

export const setPlayersActive = (players) => {
    return players.map((player) =>
        player.state === "playing" || player.state === "waiting"
            ? { ...player, state: "active" }
            : player
    );
};

export const getPlayer = (game, playerID) => {
    const players = game.players.filter((player) => player.id === playerID);
    if (players.length !== 1) return undefined;
    return players[0];
};

export const getPlayerByWhiteCards = (game, whiteCardIDs) => {
    const players = game.currentRound.whiteCardsByPlayer.filter(
        (whiteCardByPlayer) => {
            if (whiteCardIDs.length !== whiteCardByPlayer.whiteCards.length)
                return false;

            const ids = whiteCardByPlayer.whiteCards.map(
                (whiteCard) => whiteCard.id
            );
            return !whiteCardIDs.some((id) => !ids.includes(id));
        }
    );

    // There should always be exactly one player
    // No more, no less
    return players.length === 1 ? players[0].playerID : undefined;
};

export const getNextCardCzar = (players, previousCardCzarID) => {
    const activePlayerIndexes = players
        .map((player, index) =>
            ["active", "playing", "waiting"].includes(player.state)
                ? index
                : undefined
        )
        .filter((index) => index !== undefined);

    const cardCzarIndex = players.findIndex(
        (player) => player.id === previousCardCzarID
    );

    const nextCardCzars = activePlayerIndexes.filter(
        (index) => index > cardCzarIndex
    );

    // TODO: add support for the winner becoming next card czar
    if (nextCardCzars.length > 0) {
        return players[nextCardCzars[0]].id;
    } else {
        return players[activePlayerIndexes[0]].id;
    }
};

export const appointNextCardCzar = (game, previousCardCzarID) => {
    const nextCardCzarID = getNextCardCzar(game.players, previousCardCzarID);
    const players = game.players.map((player) => {
        if (player.id === previousCardCzarID) {
            return { ...player, isCardCzar: false };
        } else if (player.id === nextCardCzarID) {
            return { ...player, isCardCzar: true };
        } else {
            return player;
        }
    });
    return players;
};

export const addScore = (players, playerID, scoreToAdd) => {
    return players.map((player) =>
        player.id === playerID
            ? { ...player, score: player.score + scoreToAdd }
            : player
    );
};

export const updatePlayersIndividually = (io, game) => {
    const anonymousClient = { ...anonymizedGameClient(game) };
    const publicPlayers = publicPlayersObject(game.players);

    game.players.map((player) => {
        io.to(player.socket).emit("update_game_and_players", {
            game: anonymousClient,
            players: publicPlayers,
            player: player,
        });
    });
};

export const getActivePlayers = (players) => {
    return players.filter((player) =>
        ["active", "playing", "waiting"].includes(player.state)
    );
};

export const setPlayerDisconnected = (io, socketID, removePlayer) => {
    const result = findGameAndPlayerBySocketID(socketID);
    if (!result) return;

    const { game, player } = result;
    if (!player) return;

    if (removePlayer) {
        game.players = game.players.filter(
            (gamePlayer) => gamePlayer.id !== player.id
        );
    } else {
        player.state = "disconnected";
        game.players = game.players.map((gamePlayer) =>
            gamePlayer.id === player.id ? player : gamePlayer
        );
    }

    if (shouldGameBeDeleted(game)) {
        if (removePlayer) {
            removeGame(game.id);
            return;
        } else {
            setTimeout(
                () => removeGameIfNoActivePlayers(game.id),
                INACTIVE_GAME_DELETE_TIME
            );
            return;
        }
    }

    if (player.isHost) {
        game.players = handleHostLeaving(game, player);
        if (!game.players) return;

        const newHost = game.players.find((player) => player.isHost);
        io.to(newHost.socket).emit("upgraded_to_host");
    }

    if (shouldReturnToLobby(game)) {
        returnToLobby(io, game);
        return;
    }

    if (player.isCardCzar) {
        handleCardCzarLeaving(io, game, player);
        return;
    }

    setGame(game);
    updatePlayersIndividually(io, game);
};

export const resetPlayers = (players) => {
    return players.map((player) => ({
        ...player,
        score: 0,
        isCardCzar: false,
        popularVoteScore: 0,
        whiteCards: [],
    }));
};

const handleCardCzarLeaving = (io, game, cardCzar) => {
    game.players = appointNextCardCzar(game, cardCzar.id);
    skipRound(
        io,
        game,
        game.players.find((player) => player.isCardCzar)
    );
};

const handleHostLeaving = (game, host) => {
    const hostIndex = game.players.findIndex((player) => player.id === host.id);
    if (hostIndex !== -1) {
        game.players[hostIndex].isHost = false;
    }

    let players = [];
    if (game.stateMachine.state === "lobby") {
        players = [...game.players];
    } else {
        players = getActivePlayers(game.players);
    }

    const activePlayers = players.filter((player) => player.id !== host.id);

    if (activePlayers.length > 0) {
        game.players = game.players.map((player) =>
            player.id === activePlayers[0].id
                ? { ...player, isHost: true }
                : player
        );
    } else {
        console.log("Host left and no one to make new host, removing game...");
        removeGame(game.id);
        return undefined;
    }
    return [...game.players];
};

export const getJoiningPlayerState = (gameState, hasName) => {
    if (gameState === "lobby" && hasName) {
        return "active";
    } else {
        return joiningPlayerStates[gameState];
    }
};

export const handleJoiningPlayers = (game) => {
    return game.players.map((player) => {
        if (player.state !== "joining") return player;

        player.state = "active";
        const numberOfMissingCards =
            gameOptions.startingWhiteCardCount - player.whiteCards.length;
        if (numberOfMissingCards > 0) {
            player.whiteCards = [
                ...player.whiteCards,
                drawWhiteCards(game, numberOfMissingCards),
            ];
        }
        return player;
    });
};

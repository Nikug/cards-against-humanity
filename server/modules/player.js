import {
    anonymizeRounds,
    anonymizedGameClient,
    drawWhiteCards,
} from "./card.js";
import { gameOptions, playerName } from "../consts/gameSettings.js";
import { getGame, setGame } from "./game.js";

import { joiningPlayerStates } from "../consts/states.js";
import { nanoid } from "nanoid";
import sanitize from "sanitize";

const sanitizer = sanitize();

export const emitToAllPlayerSockets = (io, player, message, data) => {
    player.sockets.map((socket) => {
        io.to(socket).emit(message, data);
    });
};

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
        publicID: nanoid(),
        sockets: [socketID],
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

export const publicPlayersObject = (players, playerID) => {
    return players?.map((player) => {
        const { id, sockets, whiteCards, popularVoteScore, ...rest } = player;
        if (player.id === playerID) {
            return { id: playerID, ...rest };
        } else {
            return rest;
        }
    });
};

export const setPlayersPlaying = (players) => {
    return players.map((player) => {
        if (player.isCardCzar) {
            return { ...player, state: "waiting" };
        } else {
            return player.state === "active" || player.state === "waiting"
                ? { ...player, state: "playing" }
                : player;
        }
    });
};

export const setPlayersActive = (players) => {
    return players.map((player) =>
        player.state === "playing" || player.state === "waiting"
            ? { ...player, state: "active" }
            : player
    );
};

export const setPlayersWaiting = (players) => {
    return players.map((player) => {
        if (player.isCardCzar) {
            return { ...player, state: "playing" };
        } else {
            return player.state === "active" || player.state === "playing"
                ? { ...player, state: "waiting" }
                : player;
        }
    });
};

export const getPlayer = (game, playerID) => {
    return game.players.find((player) => player.id === playerID);
};

export const getRoundWinner = (round) => {
    if (!round?.whiteCardsByPlayer) return undefined;

    const cards = round.whiteCardsByPlayer.find((cards) => cards.wonRound);
    return cards?.playerID;
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

export const appointNextCardCzar = (game, previousCardCzarID, winnerID) => {
    const nextCardCzarID =
        winnerID ?? getNextCardCzar(game.players, previousCardCzarID);
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

    game.players.map((player) => {
        const playerClient = {
            ...anonymousClient,
            rounds: anonymizeRounds(anonymousClient.rounds, player.id),
        };
        emitToAllPlayerSockets(io, player, "update_game_and_players", {
            game: playerClient,
            players: publicPlayersObject(game.players, player.id),
            player: player,
        });
    });
};

export const getActivePlayers = (players) => {
    return players.filter((player) =>
        ["active", "playing", "waiting"].includes(player.state)
    );
};

export const getAllActivePlayers = (players) =>
    players.filter((player) =>
        ["active", "playing", "waiting", "pickingName"].includes(player.state)
    );

const resetPlayerState = (player) => {
    if (player.state === "disconnected" || player.state === "spectating")
        return player.state;
    return player.name.length > playerName.minimumLength
        ? "active"
        : "pickingName";
};

export const resetPlayers = (players) => {
    return players.map((player) => ({
        ...player,
        score: 0,
        state: resetPlayerState(player),
        isCardCzar: false,
        popularVoteScore: 0,
        whiteCards: [],
    }));
};

export const getJoiningPlayerState = (gameState, hasName) => {
    if (gameState === "lobby" && hasName) {
        return "active";
    } else {
        return joiningPlayerStates[gameState];
    }
};

export const handleJoiningPlayers = (io, game) => {
    return game.players.map((player) => {
        if (player.state !== "joining") return player;

        player.state = "active";
        const numberOfMissingCards =
            gameOptions.startingWhiteCardCount - player.whiteCards.length;
        if (numberOfMissingCards > 0) {
            player.whiteCards = [
                ...player.whiteCards,
                ...drawWhiteCards(game, numberOfMissingCards),
            ];
        }
        emitToAllPlayerSockets(io, player, "update_player", {
            player: player,
        });
        return player;
    });
};

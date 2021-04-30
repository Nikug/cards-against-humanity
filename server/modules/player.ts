import type * as CAH from "types";
import type * as SocketIO from "socket.io";

import { anonymizeRounds, anonymizedGameClient } from "./card";
import { getGame, setGame } from "./game";

import { PoolClient } from "pg";
import { defaultAvatar } from "./avatar";
import { joiningPlayerStates } from "../consts/states";
import { nanoid } from "nanoid";
import { playerName } from "../consts/gameSettings";
import sanitize from "sanitize";

const sanitizer = sanitize();

export const emitToAllPlayerSockets = (
    io: SocketIO.Server,
    player: CAH.Player,
    message: string,
    data: Object
) => {
    player.sockets.map((socket) => {
        io.to(socket).emit(message, data);
    });
};

export const updatePlayerName = async (
    io: SocketIO.Server,
    gameID: string,
    playerID: string,
    newName: string,
    client?: PoolClient
) => {
    const game = await getGame(gameID, client);
    if (!game) return;

    const trimmedName = newName.trim();
    if (trimmedName.length < playerName.minimumLength) return;

    const shortenedName = trimmedName.substr(0, playerName.maximumLength);
    const cleanName = sanitizer.value(shortenedName, "str");

    const player = getPlayer(game, playerID);
    if (!player) return;

    if (player.state === "pickingName") {
        player.state =
            game.stateMachine.state === "lobby" ? "active" : "joining";
    }
    const newGame = setPlayerName(game, player, cleanName);
    if (!newGame) return;

    await setGame(newGame, client);

    updatePlayersIndividually(io, newGame);
};

export const setPlayerName = (
    game: CAH.Game,
    newPlayer: CAH.Player,
    newName: string
) => {
    if (game) {
        game.players = game.players.map((player) => {
            return player.id === newPlayer.id
                ? { ...newPlayer, name: newName }
                : player;
        });
        return game;
    }
};

export const changePlayerTextToSpeech = async (
    io: SocketIO.Server,
    gameID: string,
    playerID: string,
    useTTS: boolean,
    client?: PoolClient
) => {
    const game = await getGame(gameID, client);
    if (!game) return;

    const player = getPlayer(game, playerID);
    if (!player) return;

    player.useTextToSpeech = !!useTTS;
    game.players = game.players.map((gamePlayer) =>
        gamePlayer.id === player.id ? player : gamePlayer
    );
    await setGame(game, client);

    updatePlayersIndividually(io, game);
};

export const createNewPlayer = (
    socketID: string,
    isHost: boolean,
    state: CAH.PlayerState = "pickingName"
): CAH.Player => {
    const player: CAH.Player = {
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
        avatar: defaultAvatar(),
        isPopularVoteKing: false,
    };
    return player;
};

export const publicPlayersObject = (
    players: CAH.Player[],
    playerID: string
) => {
    return players?.map((player) => {
        const { id, sockets, whiteCards, popularVoteScore, ...rest } = player;
        if (player.id === playerID) {
            return { id: playerID, ...rest };
        } else {
            return rest;
        }
    });
};

export const setPlayersPlaying = (players: CAH.Player[]): CAH.Player[] => {
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

export const setPlayersActive = (players: CAH.Player[]): CAH.Player[] => {
    return players.map((player) =>
        player.state === "playing" || player.state === "waiting"
            ? { ...player, state: "active" }
            : player
    );
};

export const setPlayersWaiting = (players: CAH.Player[]): CAH.Player[] => {
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

export const getPlayer = (game: CAH.Game, playerID?: string) => {
    return game.players.find((player) => player.id === playerID);
};

export const getRoundWinner = (round: CAH.Round) => {
    if (!round?.whiteCardsByPlayer) return undefined;

    const cards = round.whiteCardsByPlayer.find((cards) => cards.wonRound);
    return cards?.playerID;
};

export const getPlayerByWhiteCards = (
    game: CAH.Game,
    whiteCardIDs: string[]
) => {
    if (!game.currentRound) return undefined;

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

export const getNextCardCzar = (
    players: CAH.Player[],
    previousCardCzarID?: string
) => {
    const activePlayerIndexes = players
        .map((player, index) =>
            ["active", "playing", "waiting", "joining"].includes(player.state)
                ? index
                : undefined
        )
        .filter((index) => index !== undefined);

    const cardCzarIndex = players.findIndex(
        (player) => player.id === previousCardCzarID
    );

    const nextCardCzars = activePlayerIndexes.filter(
        (index) => index && index > cardCzarIndex
    );

    if (nextCardCzars.length > 0) {
        return players[nextCardCzars[0]!].id;
    } else {
        return players[activePlayerIndexes[0]!].id;
    }
};

export const appointNextCardCzar = (
    game: CAH.Game,
    previousCardCzarID?: string,
    winnerID?: string
) => {
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

export const addScore = (
    players: CAH.Player[],
    playerID: string,
    scoreToAdd: number
) => {
    return players.map((player) =>
        player.id === playerID
            ? { ...player, score: player.score + scoreToAdd }
            : player
    );
};

export const updatePlayersIndividually = (
    io: SocketIO.Server,
    game: CAH.Game
) => {
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

export const getActivePlayers = (players: CAH.Player[]) => {
    return players.filter((player) =>
        ["active", "playing", "waiting"].includes(player.state)
    );
};

export const getPlayersWithState = (
    players: CAH.Player[],
    state: CAH.PlayerState
) => {
    return players.filter((player) => player.state === state);
};

export const getActiveAndJoiningPlayers = (players: CAH.Player[]) => {
    return players.filter((player) =>
        ["active", "playing", "waiting", "joining"].includes(player.state)
    );
};

export const getAllActivePlayers = (players: CAH.Player[]) =>
    players.filter((player) =>
        ["active", "playing", "waiting", "pickingName"].includes(player.state)
    );

const resetPlayerState = (player: CAH.Player) => {
    if (player.state === "disconnected" || player.state === "spectating")
        return player.state;
    return player.name.length > playerName.minimumLength
        ? "active"
        : "pickingName";
};

export const resetPlayers = (players: CAH.Player[]): CAH.Player[] => {
    return players.map((player) => ({
        ...player,
        score: 0,
        state: resetPlayerState(player),
        isCardCzar: false,
        popularVoteScore: 0,
        whiteCards: [],
    }));
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

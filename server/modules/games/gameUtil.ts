import type * as CAH from "types";
import type * as pg from "pg";

import {
    createDBGame,
    deleteDBGame,
    getDBGame,
    getDBGameByPlayerId,
    getDBGameBySocketId,
    getDBGameIds,
    setDBGame,
} from "../db/database";
import {
    getActivePlayers,
    getAllButDisconnectedPlayers,
} from "../players/playerUtil";

let games: CAH.Game[] = [];

export const addGame = async (newGame: CAH.Game, client?: pg.PoolClient) => {
    if (process.env.USE_DB && client) {
        await createDBGame(newGame, client);
    } else {
        games = [...games, newGame];
    }
};

export const getGameIds = async (client?: pg.PoolClient) => {
    if (process.env.USE_DB && client) {
        const result = await getDBGameIds(client);
        const gameNames = result.rows.map((row) => row.gameid);
        return gameNames;
    } else {
        return games.map((game) => game.id);
    }
};

export const getGame = async (
    gameID: string,
    client?: pg.PoolClient
): Promise<CAH.Game | undefined> => {
    if (process.env.USE_DB) {
        const game = await getDBGame(gameID, client);
        return game;
    } else {
        const game = games.find((game) => game.id === gameID);
        return game;
    }
};

export const setGame = async (newGame: CAH.Game, client?: pg.PoolClient) => {
    if (process.env.USE_DB && client) {
        await setDBGame(newGame, client);
    } else {
        games = games.map((game) => {
            return game.id === newGame.id ? newGame : game;
        });
    }
    return newGame;
};

export const removeGameIfNoActivePlayers = async (
    gameID: string,
    client?: pg.PoolClient
) => {
    const game = await getGame(gameID, client);
    if (!game) return;

    if (
        !game.players ||
        getAllButDisconnectedPlayers(game.players).length === 0
    ) {
        await removeGame(gameID, client);
    }
};

export const removeGame = async (gameID: string, client?: pg.PoolClient) => {
    if (process.env.USE_DB && client) {
        await deleteDBGame(gameID, client);
    } else {
        games = games.filter((game) => game.id !== gameID);
    }
};

interface GameAndPlayer {
    player?: CAH.Player;
    game?: CAH.Game;
}

export async function findGameAndPlayerBySocketID(
    socketID: string,
    client?: pg.PoolClient
): Promise<GameAndPlayer | undefined> {
    if (process.env.USE_DB && client) {
        const game = await getDBGameBySocketId(socketID, client);
        if (!game) return undefined;

        const player: CAH.Player | undefined = game.players.find(
            (player: CAH.Player) => player.sockets.includes(socketID)
        );
        return { game, player };
    } else {
        for (let i = 0, gameCount = games.length; i < gameCount; i++) {
            for (
                let j = 0, playerCount = games[i].players.length;
                j < playerCount;
                j++
            ) {
                if (games[i].players[j].sockets.includes(socketID)) {
                    return {
                        game: { ...games[i] },
                        player: { ...games[i].players[j] },
                    };
                }
            }
        }
    }
    return undefined;
}

export const findGameByPlayerID = async (
    playerID: string,
    client?: pg.PoolClient
) => {
    if (process.env.USE_DB && client) {
        const game = await getDBGameByPlayerId(playerID, client);
        return game;
    } else {
        for (let i = 0, gameCount = games.length; i < gameCount; i++) {
            for (
                let j = 0, playerCount = games[i].players.length;
                j < playerCount;
                j++
            ) {
                if (games[i].players[j].id === playerID) {
                    return { ...games[i] };
                }
            }
        }
    }
    return undefined;
};

export const shouldGameBeDeleted = (game: CAH.Game) => {
    if (game.stateMachine.state === "lobby") {
        return game.players.every((player) =>
            ["disconnected", "spectating"].includes(player.state)
        );
    } else {
        return false;
    }
};

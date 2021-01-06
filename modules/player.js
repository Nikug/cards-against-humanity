import { nanoid } from "nanoid";

import { getGame, setGame } from "./game.js";
import { playerName } from "../consts/gameSettings.js";

export const updatePlayerName = (io, gameID, playerID, newName) => {
    const trimmedName = newName.trim();
    if (trimmedName.length < playerName.minimumLength) return;

    const validatedName = trimmedName.substr(0, playerName.maximumLength);

    // TODO: add sanitatization to the player names for obvious reasons
    const players = setPlayerName(gameID, playerID, validatedName);

    io.in(gameID).emit("update_players", {
        players: publicPlayersObject(players),
    });
};

export const createNewPlayer = (socketID, isHost) => {
    const player = {
        id: nanoid(),
        socket: socketID,
        name: "",
        state: "pickingName",
        score: 0,
        isCardCzar: false,
        isHost: isHost,
        popularVoteScore: 0,
        whiteCards: [],
    };
    return player;
};

export const publicPlayersObject = (players) => {
    return players.map((player) => ({
        name: player.name,
        state: player.state,
        score: player.score,
        isCardCzar: player.isCardCzar,
        isHost: player.isHost,
        popularVoteScore: player.popularVoteScore,
    }));
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

export const setPlayerName = (gameID, playerID, newName) => {
    const game = getGame(gameID);
    if (game) {
        game.players = game.players.map((player) => {
            return player.id === playerID
                ? { ...player, name: newName, state: "active" }
                : player;
        });
        setGame(game);
        return game.players;
    }
};

export const getPlayer = (game, playerID) => {
    const players = game.players.filter((player) => player.id === playerID);
    if (players.length !== 1) return undefined;
    return players[0];
};

export const getPlayerByWhiteCards = (game, whiteCardIDs) => {
    const players = game.currentRound.whiteCardsByPlayer.filter(whiteCardByPlayer => {
        if(whiteCardIDs.length !== whiteCardByPlayer.length) return false;

        const ids = whiteCardByPlayer.whiteCards.map(whiteCard => whiteCard.id);
        return !whiteCardIDs.some(id => !ids.includes(id));
    });

    // There should always be exactly one player
    // No more, no less
    return players.length === 1 ? players[0].playerID : undefined;
}

export const getNextCardCzar = (players, cardCzarID) => {
    const cardCzarIndex = players.findIndex(player => player.id === cardCzarID);
    const playerCount = players.length;
    
    // TODO: add support for the winner becoming next card czar
    if(cardCzarIndex === playerCount - 1) {
        return players[0].id;
    } else {
        return players[cardCzarIndex + 1].id
    }
}

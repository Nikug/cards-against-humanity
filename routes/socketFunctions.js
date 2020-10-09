import fetch from "node-fetch";

import {
    getGame,
    setGame,
    validateOptions,
    setPlayerName,
    joinGame,
    validateHost,
    addCardPackToGame,
    removeCardPackFromGame,
} from "../modules/game.js";
import { playerName } from "../consts/gameSettings.js";

export const joinToGame = (socket, io, gameID) => {
    console.log(`Join game id ${gameID}`);

    const game = getGame(gameID);
    if (game !== null) {
        socket.join(gameID);
        console.log(`Client joined room ${gameID}`);

        const player = joinGame(gameID, socket.id);

        io.in(gameID).emit("update_game", { game: game });
        socket.emit("update_player", { player: player });
    } else {
        socket.disconnect(true);
        console.log(`Client disconnected :( ${gameID}`);
    }
};

export const updateGameOptions = (io, gameID, playerID, newOptions) => {
    const game = getGame(gameID);

    if (!game) return;
    if (!validateHost(game, playerID)) return;

    game.options = validateOptions({ ...game.options, ...newOptions });
    const updatedGame = setGame(game);

    io.in(game.id).emit("update_game_options", {
        options: updatedGame.options,
    });
};

export const updatePlayerName = (io, gameID, playerID, newName) => {
    const trimmedName = newName.trim();
    if (trimmedName.length < playerName.minimumLength) return;

    const validatedName = trimmedName.substr(0, playerName.maximumLength);

    // TODO: add sanitatization to the player names for obvious reasons
    const players = setPlayerName(gameID, playerID, validatedName);

    io.in(gameID).emit("update_player_name", { players: players });
};

export const leaveFromGame = (io, gameID, playerID) => {
    const game = getGame(gameID);
    if (!!game && !!playerID) {
        game.players = game.players.map((player) => {
            return player.id === playerID
                ? { ...player, state: "disconnected" }
                : player;
        });
        setGame(game);
        io.in(gameID).emit("update_game", { game: game });
    }
};

export const addCardPack = async (io, gameID, cardPackID, playerID) => {
    const url = `https://allbad.cards/api/pack/get?pack=${cardPackID}`;
    const res = await fetch(url);
    const json = await res.json();

    if (json.message === "Pack not found!") return;

    const whiteCards = json.definition.white.map((item, i) => ({
        id: i.toString(),
        cardPackID: cardPackID,
        text: item,
    }));
    const blackCards = json.definition.black.map((item, i) => ({
        id: i.toString(),
        cardPackID: cardPackID,
        text: item.content,
        whiteCardsToPlay: item.pick,
        whiteCardsToDraw: item.draw,
    }));

    const cardPack = {
        id: json.id,
        name: json.definition.pack.name,
        isNSFW: json.isNSFW,
        whiteCards: json.definition.quantity.white,
        blackCards: json.definition.quantity.black,
    };

    const newOptions = addCardPackToGame(
        gameID,
        playerID,
        cardPack,
        whiteCards,
        blackCards
    );

    if (!!newOptions) {
        io.in(gameID).emit("update_game_options", { options: newOptions });
    }
};

export const removeCardPack = (io, gameID, cardPackID, playerID) => {
    const newOptions = removeCardPackFromGame(gameID, cardPackID, playerID);
    if (!!newOptions) {
        io.in(gameID).emit("update_game_options", { options: newOptions });
    }
};

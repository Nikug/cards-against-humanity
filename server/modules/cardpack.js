import { ERROR_TYPES, NOTIFICATION_TYPES } from "../consts/error.js";
import { getGame, setGame } from "./game.js";
import { validateHost, validateState } from "./validate.js";

import fetch from "node-fetch";
import sanitize from "sanitize";
import { sendNotification } from "./socket.js";

const sanitizer = sanitize();

export const addCardPack = async (io, socket, gameID, cardPackID, playerID) => {
    const cleanID = sanitizer.value(cardPackID, "str");
    const url = `https://allbad.cards/api/pack/get?pack=${cleanID}`;
    let json = undefined;
    try {
        const res = await fetch(url);
        json = await res.json();
    } catch (error) {
        return;
    }

    if (json?.message === "Pack not found!") {
        sendNotification(
            ERROR_TYPES.cardPackWasNotFound,
            NOTIFICATION_TYPES.error,
            { socket: socket }
        );
        return;
    }

    const whiteCards = json.definition.white.map((item, i) => ({
        id: `w-${cleanID}-${i.toString()}`,
        cardPackID: cleanID,
        text: item,
    }));
    const blackCards = json.definition.black.map((item, i) => ({
        id: `b-${cleanID}-${i.toString()}`,
        cardPackID: cleanID,
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

    const newOptions = await addCardPackToGame(
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

export const removeCardPack = async (
    io,
    socket,
    gameID,
    cardPackID,
    playerID
) => {
    const newOptions = await removeCardPackFromGame(
        socket,
        gameID,
        cardPackID,
        playerID
    );
    if (!!newOptions) {
        io.in(gameID).emit("update_game_options", { options: newOptions });
    }
};

export const addCardPackToGame = async (
    gameID,
    playerID,
    cardPack,
    whiteCards,
    blackCards
) => {
    const game = await getGame(gameID);
    if (!game) return undefined;

    if (!validateHost(game, playerID)) return undefined;

    if (
        game.client.options.cardPacks.some(
            (existingCardPack) => existingCardPack.id === cardPack.id
        )
    )
        return undefined;

    game.client.options.cardPacks = [
        ...game.client.options.cardPacks,
        cardPack,
    ];
    game.cards.whiteCards = [...game.cards.whiteCards, ...whiteCards];
    game.cards.blackCards = [...game.cards.blackCards, ...blackCards];
    setGame(game);

    return game.client.options;
};

export const removeCardPackFromGame = async (
    socket,
    gameID,
    cardPackID,
    playerID
) => {
    const game = await getGame(gameID);
    if (!game) return undefined;

    if (!validateState(game, "lobby")) {
        sendNotification(
            ERROR_TYPES.incorrectGameState,
            NOTIFICATION_TYPES.error,
            { socket: socket }
        );
        return;
    }
    if (!validateHost(game, playerID)) {
        sendNotification(
            ERROR_TYPES.forbiddenHostAction,
            NOTIFICATION_TYPES.error,
            { socket: socket }
        );
        return;
    }

    game.client.options.cardPacks = game.client.options.cardPacks.filter(
        (cardPack) => cardPack.id !== cardPackID
    );
    game.cards.whiteCards = game.cards.whiteCards.filter(
        (card) => card.cardPackID !== cardPackID
    );
    game.cards.blackCards = game.cards.blackCards.filter(
        (card) => card.cardPackID !== cardPackID
    );

    setGame(game);
    return game.client.options;
};

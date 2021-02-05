import fetch from "node-fetch";

import { getGame, setGame } from "./game.js";
import { validateHost } from "./validate.js";

export const addCardPack = async (io, gameID, cardPackID, playerID) => {
    const url = `https://allbad.cards/api/pack/get?pack=${cardPackID}`;
    const res = await fetch(url);
    const json = await res.json();

    if (json.message === "Pack not found!") return;

    const whiteCards = json.definition.white.map((item, i) => ({
        id: `w-${cardPackID}-${i.toString()}`,
        cardPackID: cardPackID,
        text: item,
    }));
    const blackCards = json.definition.black.map((item, i) => ({
        id: `b-${cardPackID}-${i.toString()}`,
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

export const addCardPackToGame = (
    gameID,
    playerID,
    cardPack,
    whiteCards,
    blackCards
) => {
    const game = getGame(gameID);
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

export const removeCardPackFromGame = (gameID, cardPackID, playerID) => {
    const game = getGame(gameID);
    if (!game) return undefined;

    if (validateState(game, "lobby")) return undefined;
    if (!validateHost(game, playerID)) return undefined;

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

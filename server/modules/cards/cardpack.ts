import type * as CAH from "types";
import type * as SocketIO from "socket.io";
import type * as pg from "pg";

import { ERROR_TYPES, NOTIFICATION_TYPES } from "../../consts/error";
import { getGame, setGame } from "../games/gameUtil";
import { validateHost, validateState } from "../utilities/validate";

import fetch from "node-fetch";
import sanitize from "sanitize";
import { sendNotification } from "../utilities/socket";

const sanitizer = sanitize();

interface ApiBlackCard {
    content: string;
    pick: number;
    draw: number;
}

export const addCardPack = async (
    io: SocketIO.Server,
    socket: SocketIO.Socket,
    gameID: string,
    cardPackID: string,
    playerID: string,
    client?: pg.PoolClient
) => {
    const cleanID = sanitizer.value(cardPackID, "str");
    const url = `https://allbad.cards/api/pack/get?pack=${cleanID}`;
    let json;
    try {
        const res = await fetch(url);
        json = await res.json();
    } catch (error) {
        sendNotification(
            ERROR_TYPES.cardPackWasNotFound,
            NOTIFICATION_TYPES.error,
            { socket: socket }
        );
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

    const whiteCards = json.definition.white.map((item: string, i: number) => ({
        id: `w-${cleanID}-${i.toString()}`,
        cardPackID: cleanID,
        text: item,
    }));
    const blackCards = json.definition.black.map(
        (item: ApiBlackCard, i: number) => ({
            id: `b-${cleanID}-${i.toString()}`,
            cardPackID: cleanID,
            text: item.content,
            whiteCardsToPlay: item.pick,
            whiteCardsToDraw: item.draw,
        })
    );

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
        blackCards,
        client
    );

    if (!!newOptions) {
        io.in(gameID).emit("update_game_options", { options: newOptions });
    }
};

export const removeCardPack = async (
    io: SocketIO.Server,
    socket: SocketIO.Socket,
    gameID: string,
    cardPackID: string,
    playerID: string,
    client?: pg.PoolClient
) => {
    const newOptions = await removeCardPackFromGame(
        socket,
        gameID,
        cardPackID,
        playerID,
        client
    );
    if (!!newOptions) {
        io.in(gameID).emit("update_game_options", { options: newOptions });
    }
};

export const addCardPackToGame = async (
    gameID: string,
    playerID: string,
    cardPack: CAH.CardPack,
    whiteCards: CAH.WhiteCard[],
    blackCards: CAH.BlackCard[],
    client?: pg.PoolClient
) => {
    const game = await getGame(gameID, client);
    if (!game) return undefined;

    if (!validateHost(game, playerID)) return undefined;

    if (
        game.client.options.cardPacks.some(
            (existingCardPack: CAH.CardPack) =>
                existingCardPack.id === cardPack.id
        )
    )
        return undefined;

    game.client.options.cardPacks = [
        ...game.client.options.cardPacks,
        cardPack,
    ];
    game.cards.whiteCards = [...game.cards.whiteCards, ...whiteCards];
    game.cards.blackCards = [...game.cards.blackCards, ...blackCards];
    await setGame(game, client);

    return game.client.options;
};

export const removeCardPackFromGame = async (
    socket: SocketIO.Socket,
    gameID: string,
    cardPackID: string,
    playerID: string,
    client?: pg.PoolClient
) => {
    const game = await getGame(gameID, client);
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
        (cardPack: CAH.CardPack) => cardPack.id !== cardPackID
    );
    game.cards.whiteCards = game.cards.whiteCards.filter(
        (card: CAH.WhiteCard) => card.cardPackID !== cardPackID
    );
    game.cards.blackCards = game.cards.blackCards.filter(
        (card: CAH.BlackCard) => card.cardPackID !== cardPackID
    );

    await setGame(game, client);
    return game.client.options;
};

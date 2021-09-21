import type * as CAH from "types";
import type * as SocketIO from "socket.io";
import type * as pg from "pg";

import { ERROR_TYPES, NOTIFICATION_TYPES } from "../../consts/error";
import { endTransaction, startTransaction } from "../db/database";
import { getGame, setGame } from "../games/gameUtil";
import { validateHost, validateState } from "../utilities/validate";

import fetch from "node-fetch";
import { sanitizeString } from "../utilities/sanitize";
import { sendNotification } from "../utilities/socket";
import { updatePlayersIndividually } from "../players/emitPlayers";

const API_URL = "https://allbad.cards/api/pack/get?pack=";

export const addCardPack = async (
    io: SocketIO.Server,
    socket: SocketIO.Socket,
    gameID: string,
    cardPackID: string,
    playerID: string,
    client?: pg.PoolClient
) => {
    const cleanID = sanitizeString(cardPackID);
    const url = `${API_URL}${cleanID}`;
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

    const cardPack = processCardPack(json);

    const newOptions = await addCardPackToGame(
        gameID,
        playerID,
        cardPack?.cardPack,
        cardPack?.whiteCards,
        cardPack?.blackCards,
        client
    );

    if (!!newOptions) {
        io.in(gameID).emit("update_game_options", { options: newOptions });
    }
};

const processCardPack = (apiPack: CAH.ApiCardPack) => {
    if (apiPack.message) {
        return null;
    }

    const whiteCards = apiPack.definition.white.map(
        (item: string, i: number) => ({
            id: `w-${apiPack.id}-${i.toString()}`,
            cardPackID: apiPack.id,
            text: item,
        })
    );
    const blackCards = apiPack.definition.black.map(
        (item: CAH.ApiBlackCard, i: number) => ({
            id: `b-${apiPack.id}-${i.toString()}`,
            cardPackID: apiPack.id,
            text: item.content,
            whiteCardsToPlay: item.pick,
            whiteCardsToDraw: item.draw,
        })
    );

    const cardPackDefinition = {
        id: apiPack.id,
        name: apiPack.definition.pack.name,
        isNsfw: apiPack.isNsfw,
        whiteCards: apiPack.definition.quantity.white,
        blackCards: apiPack.definition.quantity.black,
    };

    return {
        cardPack: cardPackDefinition,
        whiteCards: whiteCards,
        blackCards: blackCards,
    };
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
    cardPack?: CAH.CardPack,
    whiteCards?: CAH.WhiteCard[],
    blackCards?: CAH.BlackCard[],
    client?: pg.PoolClient
) => {
    if (!cardPack || !whiteCards || !blackCards) {
        return undefined;
    }
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

    const cardPackCount = game.client.options.cardPacks.length;
    game.client.options.cardPacks = game.client.options.cardPacks.filter(
        (cardPack: CAH.CardPack) => cardPack.id !== cardPackID
    );
    if (cardPackCount === game.client.options.cardPacks.length) {
        return null;
    }

    game.cards.whiteCards = game.cards.whiteCards.filter(
        (card: CAH.WhiteCard) => card.cardPackID !== cardPackID
    );
    game.cards.blackCards = game.cards.blackCards.filter(
        (card: CAH.BlackCard) => card.cardPackID !== cardPackID
    );

    await setGame(game, client);
    return game.client.options;
};

export const reloadAllCardPacks = async (
    io: SocketIO.Server,
    gameId: string,
    cardPacks: CAH.CardPack[]
) => {
    const promises = cardPacks.map(async (cardPack: CAH.CardPack) => {
        const url = `${API_URL}${cardPack.id}`;
        const res = await fetch(url);
        const json: CAH.ApiCardPack = await res.json();
        return json;
    });

    const newCards: CAH.Cards = {
        whiteCards: [],
        blackCards: [],
        sentBlackCards: [],
        playedWhiteCards: [],
        playedBlackCards: [],
    };
    const newCardPacks: CAH.CardPack[] = [];

    try {
        const responses = await Promise.all(promises);
        for (let i = 0, limit = responses.length; i < limit; i++) {
            const processed = processCardPack(responses[i]);
            processed?.cardPack && newCardPacks.push(processed.cardPack);
            if (processed) {
                newCards.whiteCards = [
                    ...newCards.whiteCards,
                    ...processed.whiteCards,
                ];
                newCards.blackCards = [
                    ...newCards.blackCards,
                    ...processed.blackCards,
                ];
            }
        }
    } catch (e) {
        // Handle error
        // Send notification or something
    } finally {
        const client = process.env.USE_DB
            ? await startTransaction()
            : undefined;
        const game = await getGame(gameId, client);
        if (!game) {
            client && endTransaction(client);
            return;
        }
        game.cards = newCards;
        game.client.options.cardPacks = newCardPacks;
        game.client.options.loadingCardPacks = false;
        await setGame(game, client);
        client && endTransaction(client);
        updatePlayersIndividually(io, game);
    }
};

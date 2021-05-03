import * as CAH from "types";
import * as SocketIO from "socket.io";
import * as pg from "pg";

import { ERROR_TYPES, NOTIFICATION_TYPES } from "../consts/error";

import { emitToAllPlayerSockets } from "./emitPlayers";
import { gameOptions } from "../consts/gameSettings";
import { getGame } from "./gameUtil";
import { sendNotification } from "./socket";
import { shuffleCards } from "./shuffleCards";
import { validateCardCzar } from "./validate";

export const dealBlackCards = (
    io: SocketIO.Server,
    socketIDs: string[],
    game: CAH.Game
) => {
    const { blackCards, game: newGame } = drawBlackCards(
        game,
        gameOptions.blackCardsToChooseFrom
    );
    socketIDs.map((socket) => {
        io.to(socket).emit("deal_black_cards", {
            blackCards: blackCards,
        });
    });
    return newGame;
};

export const replenishWhiteCards = (
    game: CAH.Game,
    io: SocketIO.Server | null = null
) => {
    for (let i = 0, limit = game.players.length; i < limit; i++) {
        const player = game.players[i];
        if (!["active", "playing", "waiting"].includes(player.state)) continue;

        const missingCards =
            gameOptions.startingWhiteCardCount - player.whiteCards.length;

        if (missingCards > 0) {
            const { game: newGame, cards } = drawWhiteCards(game, missingCards);
            player.whiteCards = [...player.whiteCards, ...cards];
            game.cards = newGame.cards;
            game.players[i] = player;

            if (io) {
                emitToAllPlayerSockets(io, player, "update_player", {
                    player: player,
                });
            }
        }
    }
    return game;
};

export const drawWhiteCards = (
    game: CAH.Game,
    count: number
): { game: CAH.Game; cards: CAH.WhiteCard[] } => {
    if (game.cards.whiteCards.length < count) {
        let cards = [...game.cards.whiteCards];
        if (game.cards.playedWhiteCards.length === 0)
            return { game, cards: [] };

        game.cards.whiteCards = shuffleCards([...game.cards.playedWhiteCards]);
        game.cards.playedWhiteCards = [];

        cards = [
            ...cards,
            ...game.cards.whiteCards.splice(0, count - cards.length),
        ];
        return { game, cards };
    } else {
        const drawnCards = game.cards.whiteCards.splice(0, count);
        return { game, cards: drawnCards };
    }
};

export const drawBlackCards = (game: CAH.Game, count: number) => {
    if (game.cards.blackCards.length < count) {
        let blackCards = [...game.cards.blackCards];

        game.cards.blackCards = shuffleCards([...game.cards.playedBlackCards]);
        game.cards.playedBlackCards = [];

        blackCards = [
            ...blackCards,
            ...game.cards.blackCards.splice(0, count - blackCards.length),
        ];

        game.cards.sentBlackCards = [...blackCards];
        return { blackCards, game };
    } else {
        const blackCards = game.cards.blackCards.splice(0, count);
        game.cards.sentBlackCards = [...blackCards];
        return { blackCards, game };
    }
};

export const sendBlackCards = async (
    socket: SocketIO.Socket,
    gameID: string,
    playerID: string,
    client?: pg.PoolClient
) => {
    const game = await getGame(gameID, client);
    if (!game) return;

    if (!validateCardCzar(game, playerID)) {
        sendNotification(
            ERROR_TYPES.forbiddenCardCzarAction,
            NOTIFICATION_TYPES.error,
            { socket: socket }
        );
        return;
    }
    if (game.stateMachine.state !== "pickingBlackCard") {
        sendNotification(
            ERROR_TYPES.incorrectGameState,
            NOTIFICATION_TYPES.error,
            { socket: socket }
        );
        return;
    }

    socket.emit("deal_black_cards", {
        blackCards: game.cards.sentBlackCards,
    });
};

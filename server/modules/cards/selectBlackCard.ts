import * as CAH from "types";
import * as SocketIO from "socket.io";
import * as pg from "pg";

import { ERROR_TYPES, NOTIFICATION_TYPES } from "../../consts/error";
import { getGame, setGame } from "../games/gameUtil";
import { validateCardCzar, validateState } from "../utilities/validate";

import { changeGameStateAfterTime } from "../utilities/delayedStateChange";
import { createRound } from "../rounds/roundUtil";
import { gameOptions } from "../../consts/gameSettings";
import { sendNotification } from "../utilities/socket";
import { setPlayersPlaying } from "../players/setPlayers";
import { shuffleCardsBackToDeck } from "./shuffleCards";
import { updatePlayersIndividually } from "../players/emitPlayers";

export const selectBlackCard = async (
    io: SocketIO.Server,
    socket: SocketIO.Socket,
    gameID: string,
    playerID: string,
    selectedCardID: string,
    discardedCardIDs: string[],
    client?: pg.PoolClient
) => {
    const game = await getGame(gameID, client);
    if (!game) return;

    if (!validateState(game, "pickingBlackCard")) {
        sendNotification(
            ERROR_TYPES.incorrectGameState,
            NOTIFICATION_TYPES.error,
            { socket: socket }
        );
        return;
    }
    if (!validateCardCzar(game, playerID)) {
        sendNotification(
            ERROR_TYPES.forbiddenCardCzarAction,
            NOTIFICATION_TYPES.error,
            { socket: socket }
        );
        return;
    }

    if (
        !game.cards.sentBlackCards.some(
            (blackCard: CAH.BlackCard) => blackCard.id === selectedCardID
        )
    )
        return;

    if (discardedCardIDs.length !== gameOptions.blackCardsToChooseFrom - 1)
        return;
    const discardedCards = game.cards.sentBlackCards.filter(
        (blackCard: CAH.BlackCard) => discardedCardIDs.includes(blackCard.id)
    );
    if (discardedCards.length !== discardedCardIDs.length) return;

    const selectedCard = game.cards.sentBlackCards.find(
        (blackCard: CAH.BlackCard) => blackCard.id === selectedCardID
    );
    if (!selectedCard) return;

    game.cards.sentBlackCards = [];

    game.cards.playedBlackCards = [
        ...game.cards.playedBlackCards,
        selectedCard,
    ];
    if (!selectedCard) return;

    game.cards.blackCards = shuffleCardsBackToDeck(
        discardedCards,
        game.cards.blackCards
    );

    game.currentRound = createRound(
        game.client.rounds.length + 1,
        selectedCard,
        playerID
    );
    game.client.rounds = [...game.client.rounds, game.currentRound];

    game.stateMachine.startPlayingWhiteCards();
    game.client.state = game.stateMachine.state;
    game.players = setPlayersPlaying(game.players);

    const updatedGame = changeGameStateAfterTime(io, game, "startReading");
    await setGame(updatedGame, client);
    updatePlayersIndividually(io, updatedGame);
};

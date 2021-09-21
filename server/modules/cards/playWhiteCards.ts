import * as CAH from "types";
import * as SocketIO from "socket.io";
import * as pg from "pg";

import { everyoneHasPlayedTurn, findPlayer } from "../players/playerUtil";
import { getGame, setGame } from "../games/gameUtil";

import { NOTIFICATION_TYPES } from "../../consts/error";
import { createWhiteCardsByPlayer } from "./cardUtil";
import { sendNotification } from "../utilities/socket";
import { startReading } from "../rounds/startReading";
import { updatePlayersIndividually } from "../players/emitPlayers";
import { validatePlayerPlayingWhiteCards } from "../utilities/validate";

export const playWhiteCards = async (
    io: SocketIO.Server,
    socket: SocketIO.Socket,
    gameID: string,
    playerID: string,
    whiteCardIDs: string[],
    client?: pg.PoolClient
) => {
    let game = await getGame(gameID, client);
    if (!game || !game.currentRound) return;

    const { error } = validatePlayerPlayingWhiteCards(
        game,
        playerID,
        whiteCardIDs
    );

    if (!!error) {
        sendNotification(error, NOTIFICATION_TYPES.error, { socket: socket });
        return;
    }

    const player = findPlayer(game.players, playerID);
    if (!player) return;

    const whiteCards = whiteCardIDs
        .map((id) => player.whiteCards.find((whiteCard) => whiteCard.id === id))
        .filter((whiteCards) => whiteCards) as CAH.WhiteCard[];

    player.whiteCards = player.whiteCards.filter(
        (whiteCard) => !whiteCardIDs.includes(whiteCard.id)
    );

    game.cards.playedWhiteCards = [
        ...game.cards.playedWhiteCards,
        ...whiteCards,
    ];

    player.state = "waiting";
    game.players = game.players.map((oldPlayer: CAH.Player) =>
        oldPlayer.id === player.id ? player : oldPlayer
    );

    game.currentRound.whiteCardsByPlayer = [
        ...game.currentRound.whiteCardsByPlayer,
        createWhiteCardsByPlayer(whiteCards, playerID, player.name),
    ];

    if (everyoneHasPlayedTurn(game)) {
        await startReading(io, game, client);
    } else {
        await setGame(game, client);
        updatePlayersIndividually(io, game);
    }
};

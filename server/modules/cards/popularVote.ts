import type * as CAH from "types";
import type * as SocketIO from "socket.io";

import {
    emitToAllPlayerSockets,
    updatePlayersIndividually,
} from "../players/emitPlayers";
import { getGame, setGame } from "../games/gameUtil";

import { NOTIFICATION_TYPES } from "../../consts/error";
import { PoolClient } from "pg";
import { findPlayer } from "../players/playerUtil";
import { gameOptions } from "../../consts/gameSettings";
import { getWhiteCardsByIDs } from "./cardUtil";
import { sendNotification } from "../utilities/socket";
import { validatePopularVote } from "../utilities/validate";

export const popularVote = async (
    io: SocketIO.Server,
    socket: SocketIO.Socket,
    gameID: string,
    playerID: string,
    whiteCardIDs: string[],
    client?: PoolClient
) => {
    const game = await getGame(gameID, client);
    if (!game || !game.currentRound) return;

    const { error } = validatePopularVote(game, playerID);
    if (!!error) {
        sendNotification(error, NOTIFICATION_TYPES.error, { socket: socket });
        return;
    }

    const whiteCardsByPlayer = getWhiteCardsByIDs(game, whiteCardIDs);
    if (!whiteCardsByPlayer) return;
    if (whiteCardsByPlayer.playerID === playerID) return;

    const playerVote = whiteCardsByPlayer.popularVotes.find(
        (id) => id === playerID
    );
    if (!!playerVote) return;

    whiteCardsByPlayer.popularVotes = [
        ...whiteCardsByPlayer.popularVotes,
        playerID,
    ];
    whiteCardsByPlayer.popularVote = whiteCardsByPlayer.popularVotes.length;

    game.currentRound.whiteCardsByPlayer = game.currentRound.whiteCardsByPlayer.map(
        (cards: CAH.WhiteCardsByPlayer) =>
            cards.playerID === whiteCardsByPlayer.playerID
                ? whiteCardsByPlayer
                : cards
    );
    const newGame = setPlayerPopularVoteScore(
        game,
        whiteCardsByPlayer.playerID,
        1
    );

    await setGame(newGame, client);
    updatePlayersIndividually(io, newGame);

    const votedCardIDs = getAllVotedCardsForPlayer(
        game.currentRound.whiteCardsByPlayer,
        playerID
    );

    const player = findPlayer(newGame.players, playerID);
    if (!player) return;
    emitToAllPlayerSockets(io, player, "send_popular_voted_cards", {
        whiteCardIDs: votedCardIDs || [],
    });
};

const setPlayerPopularVoteScore = (
    game: CAH.Game,
    playerID: string,
    scoreToAdd: number
) => {
    const player = findPlayer(game.players, playerID);
    if (!player) return game;

    player.popularVoteScore = player.popularVoteScore + scoreToAdd;
    game.players.map((oldPlayer) =>
        oldPlayer.id === playerID ? player : oldPlayer
    );
    return game;
};

export const setPopularVoteLeader = (players: CAH.Player[]) => {
    let highestScore = gameOptions.defaultScoreForShowingPopularVoteLeader;
    let highestScoringPlayers: CAH.Player[] = [];

    for (let i = 0, limit = players.length; i < limit; i++) {
        const score = players[i].popularVoteScore;
        if (score > highestScore) {
            highestScore = score;
            highestScoringPlayers = [{ ...players[i] }];
        } else if (score === highestScore) {
            highestScoringPlayers.push({ ...players[i] });
        }
    }

    return players.map((oldPlayer) => {
        const isKing = highestScoringPlayers.some(
            (highScorePlayer) => highScorePlayer.id === oldPlayer.id
        );
        return { ...oldPlayer, isPopularVoteKing: isKing };
    });
};

const getAllVotedCardsForPlayer = (
    whiteCardsByPlayer: CAH.WhiteCardsByPlayer[],
    playerID: string
) => {
    if (!whiteCardsByPlayer) return undefined;
    return whiteCardsByPlayer
        .filter((cards) => cards.popularVotes.includes(playerID))
        .map((cards) => cards.whiteCards.map((whiteCard) => whiteCard.id));
};

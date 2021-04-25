import type * as CAH from "types";
import type * as SocketIO from "socket.io";

import {
    emitToAllPlayerSockets,
    getPlayer,
    updatePlayersIndividually,
} from "./player";
import { getGame, setGame } from "./game";

import { NOTIFICATION_TYPES } from "../consts/error";
import { PoolClient } from "pg";
import { gameOptions } from "../consts/gameSettings";
import { sendNotification } from "./socket";
import { validatePopularVote } from "./validate";

export const popularVote = async (
    io: SocketIO.Server,
    socket: SocketIO.Socket,
    gameID: string,
    playerID: string,
    whiteCardIDs: string[],
    client?: PoolClient
) => {
    const game = await getGame(gameID, client);
    if (!game) return;

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

    game.currentRound.whiteCardByPlayer = whiteCardsByPlayer;
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

    const player = getPlayer(newGame, playerID);
    emitToAllPlayerSockets(io, player, "send_popular_voted_cards", {
        whiteCardIDs: votedCardIDs || [],
    });
};

const getWhiteCardsByIDs = (
    game: CAH.Game,
    whiteCardIDs: string[]
): CAH.WhiteCardsByPlayer | undefined => {
    if (!game.currentRound) return undefined;

    return game.currentRound.whiteCardsByPlayer.find((whiteCardByPlayer) => {
        if (whiteCardIDs.length !== whiteCardByPlayer.whiteCards.length)
            return false;

        const ids = whiteCardByPlayer.whiteCards.map(
            (whiteCard) => whiteCard.id
        );
        return !whiteCardIDs.some((id) => !ids.includes(id));
    });
};

const setPlayerPopularVoteScore = (
    game: CAH.Game,
    playerID: string,
    scoreToAdd: number
) => {
    const player = getPlayer(game, playerID);
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

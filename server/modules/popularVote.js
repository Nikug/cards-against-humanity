import { gameOptions } from "../consts/gameSettings.js";
import { getGame, setGame } from "./game.js";
import {
    emitToAllPlayerSockets,
    getPlayer,
    updatePlayersIndividually,
} from "./player.js";
import { validatePopularVote } from "./validate.js";

export const popularVote = (io, socket, gameID, playerID, whiteCardIDs) => {
    const game = getGame(gameID);
    if (!game) return;

    const { result, error } = validatePopularVote(game, playerID);
    if (!!error || !result) return;

    const whiteCardsByPlayer = getWhiteCardsByIDs(game, whiteCardIDs);
    if (!whiteCardsByPlayer) return;

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

    setGame(newGame);
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

const getWhiteCardsByIDs = (game, whiteCardIDs) => {
    return game.currentRound.whiteCardsByPlayer.find((whiteCardByPlayer) => {
        if (whiteCardIDs.length !== whiteCardByPlayer.whiteCards.length)
            return false;

        const ids = whiteCardByPlayer.whiteCards.map(
            (whiteCard) => whiteCard.id
        );
        return !whiteCardIDs.some((id) => !ids.includes(id));
    });
};

const setPlayerPopularVoteScore = (game, playerID, scoreToAdd) => {
    const player = getPlayer(game, playerID);
    player.popularVoteScore = player.popularVoteScore + scoreToAdd;
    game.players.map((oldPlayer) =>
        oldPlayer.id === playerID ? player : oldPlayer
    );
    return game;
};

export const setPopularVoteLeader = (players) => {
    let highestScore = gameOptions.defaultScoreForShowingPopularVoteLeader;
    let highestScoringPlayers = [];

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

const getAllVotedCardsForPlayer = (whiteCardsByPlayer, playerID) => {
    if (!whiteCardsByPlayer) return undefined;
    return whiteCardsByPlayer
        .filter((cards) => cards.popularVotes.includes(playerID))
        .map((cards) => cards.whiteCards.map((whiteCard) => whiteCard.id));
};

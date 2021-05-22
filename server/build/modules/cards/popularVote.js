"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPopularVoteLeader = exports.popularVote = void 0;
const emitPlayers_1 = require("../players/emitPlayers");
const gameUtil_1 = require("../games/gameUtil");
const error_1 = require("../../consts/error");
const playerUtil_1 = require("../players/playerUtil");
const gameSettings_1 = require("../../consts/gameSettings");
const cardUtil_1 = require("./cardUtil");
const socket_1 = require("../utilities/socket");
const validate_1 = require("../utilities/validate");
const popularVote = async (io, socket, gameID, playerID, whiteCardIDs, client) => {
    const game = await gameUtil_1.getGame(gameID, client);
    if (!game || !game.currentRound)
        return;
    const { error } = validate_1.validatePopularVote(game, playerID);
    if (!!error) {
        socket_1.sendNotification(error, error_1.NOTIFICATION_TYPES.error, { socket: socket });
        return;
    }
    const whiteCardsByPlayer = cardUtil_1.getWhiteCardsByIDs(game, whiteCardIDs);
    if (!whiteCardsByPlayer)
        return;
    if (whiteCardsByPlayer.playerID === playerID)
        return;
    const playerVote = whiteCardsByPlayer.popularVotes.find((id) => id === playerID);
    if (!!playerVote)
        return;
    whiteCardsByPlayer.popularVotes = [
        ...whiteCardsByPlayer.popularVotes,
        playerID,
    ];
    whiteCardsByPlayer.popularVote = whiteCardsByPlayer.popularVotes.length;
    game.currentRound.whiteCardsByPlayer = game.currentRound.whiteCardsByPlayer.map((cards) => cards.playerID === whiteCardsByPlayer.playerID
        ? whiteCardsByPlayer
        : cards);
    const newGame = setPlayerPopularVoteScore(game, whiteCardsByPlayer.playerID, 1);
    await gameUtil_1.setGame(newGame, client);
    emitPlayers_1.updatePlayersIndividually(io, newGame);
    const votedCardIDs = getAllVotedCardsForPlayer(game.currentRound.whiteCardsByPlayer, playerID);
    const player = playerUtil_1.findPlayer(newGame.players, playerID);
    if (!player)
        return;
    emitPlayers_1.emitToAllPlayerSockets(io, player, "send_popular_voted_cards", {
        whiteCardIDs: votedCardIDs || [],
    });
};
exports.popularVote = popularVote;
const setPlayerPopularVoteScore = (game, playerID, scoreToAdd) => {
    const player = playerUtil_1.findPlayer(game.players, playerID);
    if (!player)
        return game;
    player.popularVoteScore = player.popularVoteScore + scoreToAdd;
    game.players.map((oldPlayer) => oldPlayer.id === playerID ? player : oldPlayer);
    return game;
};
const setPopularVoteLeader = (players) => {
    let highestScore = gameSettings_1.gameOptions.defaultScoreForShowingPopularVoteLeader;
    let highestScoringPlayers = [];
    for (let i = 0, limit = players.length; i < limit; i++) {
        const score = players[i].popularVoteScore;
        if (score > highestScore) {
            highestScore = score;
            highestScoringPlayers = [{ ...players[i] }];
        }
        else if (score === highestScore) {
            highestScoringPlayers.push({ ...players[i] });
        }
    }
    return players.map((oldPlayer) => {
        const isKing = highestScoringPlayers.some((highScorePlayer) => highScorePlayer.id === oldPlayer.id);
        return { ...oldPlayer, isPopularVoteKing: isKing };
    });
};
exports.setPopularVoteLeader = setPopularVoteLeader;
const getAllVotedCardsForPlayer = (whiteCardsByPlayer, playerID) => {
    if (!whiteCardsByPlayer)
        return undefined;
    return whiteCardsByPlayer
        .filter((cards) => cards.popularVotes.includes(playerID))
        .map((cards) => cards.whiteCards.map((whiteCard) => whiteCard.id));
};

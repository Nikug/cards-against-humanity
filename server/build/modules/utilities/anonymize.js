"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicPlayersObject = exports.anonymizedGameClient = exports.anonymizeRounds = exports.anonymizePlayedWhiteCards = void 0;
const timeout_1 = require("./timeout");
const anonymizePlayedWhiteCards = (playedWhiteCards, id) => {
    return playedWhiteCards.map((card) => {
        const { popularVotes, playerID, ...rest } = card;
        return {
            ...rest,
            playerName: card.wonRound ? card.playerName : null,
            isOwn: playerID === id,
        };
    });
};
exports.anonymizePlayedWhiteCards = anonymizePlayedWhiteCards;
const anonymizeRounds = (rounds, playerID) => {
    return rounds.map((round) => {
        const anonymized = {
            cardIndex: round.cardIndex,
            round: round.round,
            whiteCardsByPlayer: exports.anonymizePlayedWhiteCards(round.whiteCardsByPlayer, playerID),
            blackCard: round.blackCard,
        };
        return anonymized;
    });
};
exports.anonymizeRounds = anonymizeRounds;
const anonymizedGameClient = (game) => {
    if (!game.client?.rounds || !game.currentRound)
        return { ...game.client };
    return {
        ...game.client,
        timers: {
            ...game.client.timers,
            passedTime: timeout_1.getPassedTime(game.id),
        },
        streak: game.streak
            ? { name: game.streak.name, wins: game.streak.wins }
            : undefined,
    };
};
exports.anonymizedGameClient = anonymizedGameClient;
const publicPlayersObject = (players, playerID) => {
    return players?.map((player) => {
        const { id, sockets, whiteCards, popularVoteScore, ...rest } = player;
        if (player.id === playerID) {
            return { id: playerID, ...rest };
        }
        else {
            return rest;
        }
    });
};
exports.publicPlayersObject = publicPlayersObject;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWhiteCardsByIDs = exports.createWhiteCardsByPlayer = void 0;
const createWhiteCardsByPlayer = (whiteCards, playerID, playerName) => {
    return {
        wonRound: false,
        playerID: playerID,
        playerName: playerName,
        popularVote: 0,
        popularVotes: [],
        whiteCards: whiteCards,
    };
};
exports.createWhiteCardsByPlayer = createWhiteCardsByPlayer;
const getWhiteCardsByIDs = (game, whiteCardIDs) => {
    if (!game.currentRound)
        return undefined;
    return game.currentRound.whiteCardsByPlayer.find((whiteCardByPlayer) => {
        if (whiteCardIDs.length !== whiteCardByPlayer.whiteCards.length)
            return false;
        const ids = whiteCardByPlayer.whiteCards.map((whiteCard) => whiteCard.id);
        return !whiteCardIDs.some((id) => !ids.includes(id));
    });
};
exports.getWhiteCardsByIDs = getWhiteCardsByIDs;

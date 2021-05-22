"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRound = void 0;
const createRound = (roundNumber, blackCard, cardCzarID) => {
    return {
        round: roundNumber,
        blackCard: blackCard,
        cardCzar: cardCzarID,
        cardIndex: 0,
        whiteCardsByPlayer: [],
    };
};
exports.createRound = createRound;

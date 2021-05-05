import * as CAH from "types";

export const createRound = (
    roundNumber: number,
    blackCard: CAH.BlackCard,
    cardCzarID: string
) => {
    return {
        round: roundNumber,
        blackCard: blackCard,
        cardCzar: cardCzarID,
        cardIndex: 0,
        whiteCardsByPlayer: [],
    };
};

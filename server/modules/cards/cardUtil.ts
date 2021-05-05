import type * as CAH from "types";

export const createWhiteCardsByPlayer = (
    whiteCards: CAH.WhiteCard[],
    playerID: string,
    playerName: string
): CAH.WhiteCardsByPlayer => {
    return {
        wonRound: false,
        playerID: playerID,
        playerName: playerName,
        popularVote: 0,
        popularVotes: [],
        whiteCards: whiteCards,
    };
};

export const getWhiteCardsByIDs = (
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

import type * as CAH from "types";

export const removeAllCards = (game: CAH.Game) => {
    game.cards.blackCards = [];
    game.cards.playedBlackCards = [];
    game.cards.whiteCards = [];
    game.cards.playedWhiteCards = [];
    game.cards.sentBlackCards = [];
    game.players = game.players.map((player: CAH.Player) => ({
        ...player,
        whiteCards: [],
    }));

    return game;
};

import * as CAH from "types";

import { getPassedTime } from "./timeout";

export const anonymizePlayedWhiteCards = (
    playedWhiteCards: CAH.WhiteCardsByPlayer[],
    id: string
) => {
    return playedWhiteCards.map((card) => {
        const { popularVotes, playerID, ...rest } = card;
        return {
            ...rest,
            playerName: card.wonRound ? card.playerName : null,
            isOwn: playerID === id,
        };
    });
};

export const anonymizeRounds = (
    rounds: CAH.Round[],
    playerID: string
): CAH.PublicRound[] => {
    return rounds.map((round) => {
        const anonymized: CAH.PublicRound = {
            cardIndex: round.cardIndex,
            round: round.round,
            whiteCardsByPlayer: anonymizePlayedWhiteCards(
                round.whiteCardsByPlayer,
                playerID
            ),
            blackCard: round.blackCard,
        };
        return anonymized;
    });
};

export const anonymizedGameClient = (game: CAH.Game) => {
    if (!game.client?.rounds || !game.currentRound) return { ...game.client };

    return {
        ...game.client,
        timers: {
            ...game.client.timers,
            passedTime: getPassedTime(game.id),
        },
        streak: game.streak
            ? { name: game.streak.name, wins: game.streak.wins }
            : undefined,
    };
};

export const publicPlayersObject = (
    players: CAH.Player[],
    playerID: string
) => {
    return players?.map((player) => {
        const { id, sockets, whiteCards, popularVoteScore, ...rest } = player;
        if (player.id === playerID) {
            return { id: playerID, ...rest };
        } else {
            return rest;
        }
    });
};

import type * as CAH from "types";

export const addScore = (
    players: CAH.Player[],
    playerID: string,
    scoreToAdd: number
) => {
    return players.map((player) =>
        player.id === playerID
            ? { ...player, score: player.score + scoreToAdd }
            : player
    );
};

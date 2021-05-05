import * as CAH from "types";

export const addStreak = (
    streak: CAH.Streak | undefined,
    player: CAH.Player
) => {
    if (streak && streak.id === player.id) {
        streak.wins += 1;
        return streak;
    } else {
        return createStreak(player);
    }
};

const createStreak = (player: CAH.Player): CAH.Streak => {
    return {
        id: player.id,
        name: player.name,
        wins: 1,
    };
};

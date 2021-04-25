import { Player, Streak } from "types";

export const addStreak = (streak: Streak | undefined, player: Player) => {
    if (streak && streak.id === player.id) {
        streak.wins += 1;
        return streak;
    } else {
        return createStreak(player);
    }
};

const createStreak = (player: Player): Streak => {
    return {
        id: player.id,
        name: player.name,
        wins: 1,
    };
};

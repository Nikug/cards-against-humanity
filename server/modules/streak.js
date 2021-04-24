export const addStreak = (streak, player) => {
    if (streak && streak.id === player.id) {
        streak.wins += 1;
        return streak;
    } else {
        return createStreak(player);
    }
};

const createStreak = (player) => {
    return {
        id: player.id,
        name: player.name,
        wins: 1,
    };
};

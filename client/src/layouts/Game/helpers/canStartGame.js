const PLAYER_LIMIT = 2;
const CARDPACK_LIMIT = 1;

// Game can be started if there is atleast two active players and atleast one cardpack.
export const canStartGame = (options, players = []) => {
    if (!options) {
        return false;
    }

    const activePlayers = players.filter((player) => {
        return player.state === 'active';
    });

    const enoughActivePlayers = activePlayers.length >= PLAYER_LIMIT;
    const enoughCardpacks = options?.cardPacks?.length >= CARDPACK_LIMIT;

    return enoughActivePlayers && enoughCardpacks;
};

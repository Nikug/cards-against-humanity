import * as CAH from "types";

export const getNextCardCzar = (
    players: CAH.Player[],
    previousCardCzarID?: string
) => {
    const activePlayerIndexes = players
        .map((player, index) =>
            ["active", "playing", "waiting", "joining"].includes(player.state)
                ? index
                : undefined
        )
        .filter((index) => index !== undefined);

    const cardCzarIndex = players.findIndex(
        (player) => player.id === previousCardCzarID
    );

    const nextCardCzars = activePlayerIndexes.filter(
        (index) => index != null && index > cardCzarIndex
    );

    if (nextCardCzars.length > 0) {
        return players[nextCardCzars[0]!].id;
    } else {
        return players[activePlayerIndexes[0]!].id;
    }
};

export const appointNextCardCzar = (
    game: CAH.Game,
    previousCardCzarID?: string,
    winnerID?: string
) => {
    const nextCardCzarID =
        winnerID ?? getNextCardCzar(game.players, previousCardCzarID);
    const players = game.players.map((player) => {
        if (player.id === previousCardCzarID) {
            return { ...player, isCardCzar: false };
        } else if (player.id === nextCardCzarID) {
            return { ...player, isCardCzar: true };
        } else {
            return player;
        }
    });
    return players;
};

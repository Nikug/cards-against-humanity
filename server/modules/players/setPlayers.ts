import * as CAH from "types";

export const setPlayersPlaying = (players: CAH.Player[]): CAH.Player[] => {
    return players.map((player) => {
        if (player.isCardCzar) {
            return { ...player, state: "waiting" };
        } else {
            return player.state === "active" || player.state === "waiting"
                ? { ...player, state: "playing" }
                : player;
        }
    });
};

export const setPlayersActive = (players: CAH.Player[]): CAH.Player[] => {
    return players.map((player) =>
        player.state === "playing" || player.state === "waiting"
            ? { ...player, state: "active" }
            : player
    );
};

export const setPlayersWaiting = (players: CAH.Player[]): CAH.Player[] => {
    return players.map((player) => {
        if (player.isCardCzar) {
            return { ...player, state: "playing" };
        } else {
            return ["active", "playing", "joining"].includes(player.state)
                ? { ...player, state: "waiting" }
                : player;
        }
    });
};

import * as CAH from "types";

import { playerName } from "../../consts/gameSettings";

const resetPlayerState = (player: CAH.Player) => {
    if (player.state === "disconnected" || player.state === "spectating")
        return player.state;
    return player.name.length > playerName.minimumLength
        ? "active"
        : "pickingName";
};

export const resetPlayers = (players: CAH.Player[]): CAH.Player[] => {
    const filteredPlayers = players.filter(
        (player) => player.state !== "leaving"
    );
    return filteredPlayers.map((player) => ({
        ...player,
        score: 0,
        state: resetPlayerState(player),
        isCardCzar: false,
        popularVoteScore: 0,
        whiteCards: [],
    }));
};

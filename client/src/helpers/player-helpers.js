export const isPlayerSpectator = (player) => {
    if (!player) {
        return false;
    }

    return player.state === "spectating";
};

export const isPlayerHost = (player) => {
    if (!player) {
        return false;
    }

    return player.isHost;
};

export const isPlayerCardCzar = (player) => {
    if (!player) {
        return false;
    }

    return player.isCardCzar;
};

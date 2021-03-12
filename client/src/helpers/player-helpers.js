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

export const isPlayerJoining = (player) => {
    if (!player) {
        return false;
    }

    return player.state === "joining";
};

export const isPlayerSpectatorOrJoining = (player) => {
    if (!player) {
        return false;
    }

    return isPlayerSpectator(player) || isPlayerJoining(player);
};

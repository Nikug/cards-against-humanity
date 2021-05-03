import * as CAH from "types";
import * as SocketIO from "socket.io";

interface Timeout {
    id: string;
    timeout: NodeJS.Timeout;
}

let timeouts: Timeout[] = [];

export const removeTimeout = (id: string) => {
    const timeout = timeouts.find((timeout) => timeout.id === id);
    if (timeout) clearTimeout(timeout.timeout);
    timeouts = timeouts.filter((timeout) => timeout.id !== id);
};

export const addTimeout = (id: string, timeout: NodeJS.Timeout) => {
    timeouts = [...timeouts, { id, timeout }];
};

export const getTimeout = (id: string) => {
    const timeout = timeouts.find((timeout) => timeout.id === id);
    return timeout?.timeout;
};

export const getTimeoutTime = (game: CAH.Game) => {
    const timers = game.client.options.timers;
    switch (game.stateMachine.state) {
        case "pickingBlackCard":
            return timers.useSelectBlackCard
                ? timers.selectBlackCard
                : undefined;
        case "playingWhiteCards":
            return timers.useSelectWhiteCards
                ? timers.selectWhiteCards
                : undefined;
        case "readingCards":
            return timers.useReadBlackCard ? timers.readBlackCard : undefined;
        case "showingCards":
            return timers.useSelectWinner ? timers.selectWinner : undefined;
        case "roundEnd":
            return timers.useRoundEnd ? timers.roundEnd : undefined;
        default:
            return timers.selectBlackCard;
    }
};

export const getPassedTime = (id: string) => {
    const timeout = getTimeout(id);
    if (!timeout) return undefined;
    // @ts-ignore
    return process.uptime() - timeout._idleStart / 1000;
};

export const updateTimers = (io: SocketIO.Server, game: CAH.Game) => {
    io.in(game.id).emit("update_timers", {
        timers: {
            duration: game.client.timers.duration,
            passedTime: getPassedTime(game.id),
        },
    });
};

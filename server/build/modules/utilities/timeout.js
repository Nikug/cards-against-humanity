"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTimers = exports.getPassedTime = exports.getTimeoutTime = exports.getTimeout = exports.addTimeout = exports.removeTimeout = void 0;
let timeouts = [];
const removeTimeout = (id) => {
    const timeout = timeouts.find((timeout) => timeout.id === id);
    if (timeout)
        clearTimeout(timeout.timeout);
    timeouts = timeouts.filter((timeout) => timeout.id !== id);
};
exports.removeTimeout = removeTimeout;
const addTimeout = (id, timeout) => {
    timeouts = [...timeouts, { id, timeout }];
};
exports.addTimeout = addTimeout;
const getTimeout = (id) => {
    const timeout = timeouts.find((timeout) => timeout.id === id);
    return timeout?.timeout;
};
exports.getTimeout = getTimeout;
const getTimeoutTime = (game) => {
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
exports.getTimeoutTime = getTimeoutTime;
const getPassedTime = (id) => {
    const timeout = exports.getTimeout(id);
    if (!timeout)
        return undefined;
    // @ts-ignore
    return process.uptime() - timeout._idleStart / 1000;
};
exports.getPassedTime = getPassedTime;
const updateTimers = (io, game) => {
    io.in(game.id).emit("update_timers", {
        timers: {
            duration: game.client.timers.duration,
            passedTime: exports.getPassedTime(game.id),
        },
    });
};
exports.updateTimers = updateTimers;

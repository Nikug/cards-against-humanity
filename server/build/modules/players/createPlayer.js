"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewPlayer = void 0;
const avatar_1 = require("./avatar");
const nanoid_1 = require("nanoid");
const createNewPlayer = (socketID, isHost, state = "pickingName") => {
    const player = {
        id: nanoid_1.nanoid(),
        publicID: nanoid_1.nanoid(),
        sockets: [socketID],
        name: "",
        state: state,
        score: 0,
        isCardCzar: false,
        isHost: isHost,
        popularVoteScore: 0,
        whiteCards: [],
        useTextToSpeech: false,
        avatar: avatar_1.defaultAvatar(),
        isPopularVoteKing: false,
    };
    return player;
};
exports.createNewPlayer = createNewPlayer;

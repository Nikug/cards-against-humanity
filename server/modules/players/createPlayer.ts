import * as CAH from "types";

import { defaultAvatar } from "./avatar";
import { nanoid } from "nanoid";

export const createNewPlayer = (
    socketID: string,
    isHost: boolean,
    state: CAH.PlayerState = "pickingName"
): CAH.Player => {
    const player: CAH.Player = {
        id: nanoid(),
        publicID: nanoid(),
        sockets: [socketID],
        name: "",
        state: state,
        score: 0,
        isCardCzar: false,
        isHost: isHost,
        popularVoteScore: 0,
        whiteCards: [],
        useTextToSpeech: false,
        avatar: defaultAvatar(),
        isPopularVoteKing: false,
    };
    return player;
};

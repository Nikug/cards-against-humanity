import { PLAYER_STATES } from "../consts/playerstates";
import { getWhiteCards } from "./fakecarddata";

export function getPlayersList() {
    return [
        {
            name: "player 1",
            state: PLAYER_STATES.ACTIVE,
            score: 2,
            isCardCzar: true,
            isHost: false,
            popularVoteScore: 3,
        },
        {
            name:
                "player 2 with a very long long name long long name long long name long long name long long name long long name long long name",
            state: PLAYER_STATES.DISCONNECTED,
            score: 3,
            isCardCzar: false,
            isHost: true,
            popularVoteScore: 3,
        },
        {
            name: "player 3",
            state: PLAYER_STATES.PLAYING,
            score: 0,
            isCardCzar: false,
            isHost: false,
            popularVoteScore: 3,
        },
        {
            name: "player 4",
            state: PLAYER_STATES.WAITING,
            score: 1,
            isCardCzar: false,
            isHost: false,
            popularVoteScore: 3,
        },
    ];
}

export function getPlayer() {
    return {
        id: "player-id-1",
        socket: "random-socket",
        name: "player 1",
        state: PLAYER_STATES.ACTIVE,
        score: 2,
        isCardCzar: true,
        isHost: false,
        popularVoteScore: 3,
        whiteCards: getWhiteCards,
    };
}

import StateMachine from "javascript-state-machine";

export const createStateMachine = () => {
    const fsm = new StateMachine({
        init: "lobby",
        transitions: [
            { name: "startGame",                from: "lobby",              to: "pickingBlackCard"  },
            { name: "startPlayingWhiteCards",   from: "pickingBlackCard",   to: "playingWhiteCards" },
            { name: "startReading",             from: "playingWhiteCards",  to: "readingCards"      },
            { name: "showCards",                from: "readingCards",       to: "showingCards"      },
            { name: "endRound",                 from: "showingCards",       to: "roundEnd"          },
            { name: "endGame",                  from: "roundEnd",           to: "gameOver"          },
            { name: "returnToLobby",            from: "*",                  to: "lobby"             },
        ],
    });
    return fsm;
};

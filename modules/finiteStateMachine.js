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
            { name: "startRound",               from: "roundEnd",           to: "pickingBlackCard"  },
            { name: "endGame",                  from: "roundEnd",           to: "gameOver"          },

            { name: "returnToLobby",            from: "*",                  to: "lobby"             },
            { name: "skipRound",                from: "*",                  to: "pickingBlackCard"  }
        ],
    });
    return fsm;
};

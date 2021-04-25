import { Game } from "types";
import { createStateMachine } from "./finiteStateMachine";
import { gameOptions } from "../consts/gameSettings";

export const newGameTemplate = (url: string): Game => {
    const fsm = createStateMachine();
    const game = {
        id: url,
        client: {
            id: url,
            state: fsm.state,
            options: {
                maximumPlayers: gameOptions.defaultPlayers,
                winConditions: {
                    scoreLimit: gameOptions.winConditions.scoreLimit.default,
                    useScoreLimit: gameOptions.winConditions.scoreLimit.use,
                    roundLimit: gameOptions.winConditions.roundLimit.default,
                    useRoundLimit: gameOptions.winConditions.roundLimit.use,
                },
                popularVote: gameOptions.allowPopularVote,
                winnerBecomesCardCzar: gameOptions.defaultWinnerBecomesCardCzar,
                allowKickedPlayerJoin: gameOptions.defaultAllowKickedPlayerJoin,
                allowCardCzarPopularVote:
                    gameOptions.defaultAllowCardCzarPopularVote,
                cardPacks: [],
                timers: {
                    selectBlackCard: gameOptions.timers.selectBlackCard.default,
                    useSelectBlackCard: gameOptions.timers.selectBlackCard.use,
                    selectWhiteCards:
                        gameOptions.timers.selectWhiteCards.default,
                    useSelectWhiteCards:
                        gameOptions.timers.selectWhiteCards.use,
                    readBlackCard: gameOptions.timers.readBlackCard.default,
                    useReadBlackCard: gameOptions.timers.readBlackCard.use,
                    selectWinner: gameOptions.timers.selectWinner.default,
                    useSelectWinner: gameOptions.timers.selectWinner.use,
                    roundEnd: gameOptions.timers.roundEnd.default,
                    useRoundEnd: gameOptions.timers.roundEnd.use,
                },
            },
            rounds: [],
            timers: {
                duration: undefined,
                passedTime: undefined,
            },
        },
        players: [],
        cards: {
            whiteCards: [],
            blackCards: [],
            sentBlackCards: [],
            playedWhiteCards: [],
            playedBlackCards: [],
        },
        stateMachine: fsm,
        currentRound: {
            round: 0,
            blackCard: null,
            cardCzar: null,
            cardIndex: 0,
            whiteCardsByPlayer: [],
        },
        timeout: undefined,
    };
    return game;
};

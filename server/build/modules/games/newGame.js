"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newGameTemplate = void 0;
const finiteStateMachine_1 = require("../utilities/finiteStateMachine");
const gameSettings_1 = require("../../consts/gameSettings");
const newGameTemplate = (url) => {
    const fsm = finiteStateMachine_1.createStateMachine();
    const game = {
        id: url,
        client: {
            id: url,
            state: fsm.state,
            options: {
                maximumPlayers: gameSettings_1.gameOptions.defaultPlayers,
                winConditions: {
                    scoreLimit: gameSettings_1.gameOptions.winConditions.scoreLimit.default,
                    useScoreLimit: gameSettings_1.gameOptions.winConditions.scoreLimit.use,
                    roundLimit: gameSettings_1.gameOptions.winConditions.roundLimit.default,
                    useRoundLimit: gameSettings_1.gameOptions.winConditions.roundLimit.use,
                },
                popularVote: gameSettings_1.gameOptions.allowPopularVote,
                winnerBecomesCardCzar: gameSettings_1.gameOptions.defaultWinnerBecomesCardCzar,
                allowKickedPlayerJoin: gameSettings_1.gameOptions.defaultAllowKickedPlayerJoin,
                allowCardCzarPopularVote: gameSettings_1.gameOptions.defaultAllowCardCzarPopularVote,
                cardPacks: [],
                timers: {
                    selectBlackCard: gameSettings_1.gameOptions.timers.selectBlackCard.default,
                    useSelectBlackCard: gameSettings_1.gameOptions.timers.selectBlackCard.use,
                    selectWhiteCards: gameSettings_1.gameOptions.timers.selectWhiteCards.default,
                    useSelectWhiteCards: gameSettings_1.gameOptions.timers.selectWhiteCards.use,
                    readBlackCard: gameSettings_1.gameOptions.timers.readBlackCard.default,
                    useReadBlackCard: gameSettings_1.gameOptions.timers.readBlackCard.use,
                    selectWinner: gameSettings_1.gameOptions.timers.selectWinner.default,
                    useSelectWinner: gameSettings_1.gameOptions.timers.selectWinner.use,
                    roundEnd: gameSettings_1.gameOptions.timers.roundEnd.default,
                    useRoundEnd: gameSettings_1.gameOptions.timers.roundEnd.use,
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
exports.newGameTemplate = newGameTemplate;

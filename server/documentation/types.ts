// Documentation for different types used

import StateMachine from "javascript-state-machine";

interface Game {
    id: string;
    players: Player[];
    cards: Cards;
    stateMachine: typeof StateMachine;
    client: ClientGame;
    currentRound: Round;
    timeout: NodeJS.Timeout;
}

interface ClientGame {
    id: string;
    state: GameState;
    options: Options;
    rounds: Round[];
    timers: ClientTimers;
}

interface ClientTimers {
    duration: number | undefined; // Seconds
    passedTime: number | undefined; // Seconds
}

// This information is only shown to each player separately
interface Player {
    id: string;
    publicID: string;
    sockets: string;
    name: string;
    state: PlayerState;
    score: number;
    isCardCzar: boolean;
    isHost: boolean;
    isPopularVoteKing: boolean;
    popularVoteScore: number;
    whiteCards: WhiteCard[];
    useTextToSpeech: boolean;
    avatar: Avatar;
}

// This information about a player is shown to other players
// It is a subset of the playerObject
interface PlayerPublic {
    name: string;
    state: PlayerState;
    score: number;
    isCardCzar: boolean;
    isHost: boolean;
    isPopularVoteKing: boolean;
    useTextToSpeech: boolean;
    avatar: Avatar;
}

interface Avatar {
    hatType: number;
    eyeType: number;
    mouthType: number;
    skinType: number;
}

interface Cards {
    whiteCards: WhiteCard[];
    blackCards: BlackCard[];
    sentBlackCards: BlackCard[];
    playedWhiteCards: WhiteCard[];
    playedBlackCards: BlackCard[];
}

interface WhiteCard {
    id: string;
    cardPackID: string;
    text: string;
}

interface BlackCard {
    id: string;
    cardPackID: string;
    text: string;
    whiteCardsToPlay: number;
    whiteCardsToDraw: number;
}

interface Round {
    round: number;
    blackCard: BlackCard;
    cardCzar: string; // Not shown in client
    cardIndex: number; // Used to show cards one by one
    whiteCardsByPlayer: {
        wonRound: boolean;
        playerID: string; // Not shown in client
        playerName: String | null; // Always null unless is winner in client
        popularVote: number;
        popularVotes: string[]; // List of player ids who voted for this player
        whiteCards: WhiteCard[];
        isOwn: boolean;
    }[];
}

interface Options {
    maximumPlayers: number;
    winConditions: winConditions;
    winnerBecomesCardCzar: boolean;
    allowKickedPlayerJoin: boolean;
    allowCardCzarPopularVote: boolean;
    popularVote: boolean;
    cardPacks: CardPack[];
    selectWhiteCardTimeLimit: number;
    selectBlackCardTimeLimit: number;
    timers: Timers;
}

interface winConditions {
    scoreLimit: number;
    useScoreLimit: boolean;

    roundLimit: number;
    useRoundLimit: boolean;
}

// Values in seconds
interface Timers {
    selectBlackCard: number;
    useSelectBlackCard: boolean;

    selectWhiteCards: number;
    useSelectWhiteCards: boolean;

    readBlackCard: number;
    useReadBlackCard: boolean;

    selectWinner: number;
    useSelectWinner: boolean;

    roundEnd: number;
    useRoundEnd: boolean;
}

interface CardPack {
    id: string;
    name: string;
    isNSFW: boolean;
    whiteCards: number;
    blackCards: number;
}

interface Notification {
    text: string;
    type?: "default" | "error" | "success";
    time?: number; // seconds
}

type GameState =
    | "lobby"
    | "pickingBlackCard"
    | "playingWhiteCards"
    | "readingCards"
    | "showingCards"
    | "roundEnd"
    | "gameOver";

type PlayerState =
    // Playing states
    | "active" // Default active state
    | "playing" // Picking a white card
    | "waiting" // Has played white cards, waiting for pick phase to end
    // Other states
    | "joining"
    | "pickingName"
    | "disconnected"
    | "spectating";

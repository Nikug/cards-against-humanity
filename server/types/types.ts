// Documentation for different types used

import { Server, Socket } from "socket.io";

import type StateMachine from "javascript-state-machine";

export interface Game {
    id: string;
    players: Player[];
    cards: Cards;
    stateMachine: StateMachine.StateMachine;
    client: ClientGame;
    currentRound?: Round;
    timeout?: NodeJS.Timeout;
    streak?: Streak;
}

export interface ClientGame {
    id: string;
    state: GameState;
    options: Options;
    rounds: Round[];
    timers: ClientTimers;
    streak?: PublicStreak;
}

export interface ClientTimers {
    duration: number | undefined; // Seconds
    passedTime: number | undefined; // Seconds
}

// This information is only shown to each player separately
export interface Player extends PlayerPublic {
    id: string;
    sockets: string[];
    popularVoteScore: number;
    whiteCards: WhiteCard[];
}

// This information about a player is shown to other players
// It is a subset of the playerObject
export interface PlayerPublic {
    publicID: string;
    name: string;
    state: PlayerState;
    score: number;
    isCardCzar: boolean;
    isHost: boolean;
    isPopularVoteKing: boolean;
    useTextToSpeech: boolean;
    avatar: Avatar;
}

export interface Streak extends PublicStreak {
    id: string;
}

export interface PublicStreak {
    name: string;
    wins: number;
}

export interface Avatar {
    hatType: number;
    eyeType: number;
    mouthType: number;
    skinType: number;
}

export interface Cards {
    whiteCards: WhiteCard[];
    blackCards: BlackCard[];
    sentBlackCards: BlackCard[];
    playedWhiteCards: WhiteCard[];
    playedBlackCards: BlackCard[];
}

export interface WhiteCard {
    id: string;
    cardPackID: string;
    text: string;
}

export interface BlackCard {
    id: string;
    cardPackID: string;
    text: string;
    whiteCardsToPlay: number;
    whiteCardsToDraw: number;
}

export interface Round extends PublicRound {
    cardCzar: string | null;
    whiteCardsByPlayer: WhiteCardsByPlayer[];
}

export interface PublicRound {
    round: number;
    cardIndex: number;
    blackCard: BlackCard | null;
    whiteCardsByPlayer: WhiteCardsByPlayerPublic[];
}

export interface WhiteCardsByPlayer extends WhiteCardsByPlayerPublic {
    playerID: string; // Not shown in client
    playerName: String; // Always null unless is winner in client
    popularVotes: string[]; // List of player ids who voted for this player
}

export interface WhiteCardsByPlayerPublic {
    wonRound: boolean;
    playerName: String | null;
    popularVote: number;
    whiteCards: WhiteCard[];
    isOwn?: boolean;
}

export interface Options {
    maximumPlayers: number;
    winConditions: winConditions;
    winnerBecomesCardCzar: boolean;
    allowKickedPlayerJoin: boolean;
    allowCardCzarPopularVote: boolean;
    popularVote: boolean;
    cardPacks: CardPack[];
    timers: Timers;
    password?: string;
}

export interface winConditions {
    scoreLimit: number;
    useScoreLimit: boolean;

    roundLimit: number;
    useRoundLimit: boolean;
}

// Values in seconds
export interface Timers {
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
    [key: string]: number | boolean;
}

export interface CardPack {
    id: string;
    name: string;
    isNsfw: boolean;
    whiteCards: number;
    blackCards: number;
}

export interface Notification {
    text: string;
    type?: NotificationType;
    time?: number; // seconds
}

export interface ApiBlackCard {
    pick: number;
    draw: number;
    content: string;
}

export interface ApiCardPack {
    message?: string;
    _id: string;
    id: string;
    categories: string[];
    dateCreated: string;
    dateUpdated: string;
    definition: {
        white: string[];
        black: ApiBlackCard[];
        family: boolean;
        pack: {
            name: string;
            id: string;
        };
        quantity: {
            white: number;
            black: number;
            total: number;
        };
        levelReq: string;
        packType: string;
        retired: boolean;
    };
    favorites: number;
    isNsfw: boolean;
    isPublic: boolean;
    owner: string;
    packId: string;
    oldOwner: string;
    buildVersion: number;
}

export type GameState =
    | "lobby"
    | "pickingBlackCard"
    | "playingWhiteCards"
    | "readingCards"
    | "showingCards"
    | "roundEnd"
    | "gameOver";

export type PlayerState =
    // Playing states
    | "active" // Default active state
    | "playing" // Picking a white card
    | "waiting" // Has played white cards, waiting for pick phase to end
    // Other states
    | "joining"
    | "pickingName"
    | "disconnected"
    | "spectating";

export type NotificationType = "default" | "error" | "success";
export type NotificationTypes = { [key: string]: NotificationType };
export type NotificationOptions = {
    io?: Server;
    socket?: Socket;
    sockets?: string[];
    gameID?: string;
};

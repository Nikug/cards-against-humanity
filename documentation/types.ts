// Documentation for game object
import StateMachine from "javascript-state-machine";

interface Game {
    id: string;
    players: Player[];
    cards: Cards;
    stateMachine: typeof StateMachine;
    client: ClientGame;
    currentRound: Round;
}

interface ClientGame {
    id: string;
    state: GameState;
    options: Options;
    rounds: Round[];
}

interface Player {
    id: string;
    socket: string;
    name: string;
    state: PlayerState;
    score: number;
    isCardCzar: boolean;
    isHost: boolean;
    popularVoteScore: number;
    whiteCards: WhiteCard[];
}

interface Cards {
    whiteCards: WhiteCard[];
    blackCards: BlackCard[];
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
    cardCzar: string;
    whiteCardsByPlayer: {
        wonRound: boolean;
        playerID: string;
        popularVote: number;
        whiteCards: WhiteCard[];
    } [];
}

interface Options {
    maximumPlayers: number;
    scoreLimit: number;
    winnerBecomesCardCzar: boolean;
    allowKickedPlayerJoin: boolean;
    cardPacks: CardPack[];
}

interface CardPack {
    id: string;
    name: string;
    isNSFW: boolean;
    whiteCards: number;
    blackCards: number;
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
    // Active states
    | "active"      // Default active state
    | "playing"     // Picking a white card
    | "waiting"     // Has played white cards, waiting for pick phase to end
    // Inactive states
    | "pickingName"
    | "disconnected"
    | "spectating"
    | "kicked";

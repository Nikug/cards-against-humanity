// Documentation for different types used
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

// This information is only shown to each player separately
interface Player {
    id: string;
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
    cardCzar: string;
    cardIndex: number; // Used to show cards one by one
    whiteCardsByPlayer: {
        wonRound: boolean;
        // TODO: change to be playerName
        playerID: string | null; // Always null unless is winner in client
        popularVote: number;
        popularVotes: string[]; // List of player ids who voted for this player
        whiteCards: WhiteCard[];
    }[];
}

interface Options {
    maximumPlayers: number;
    scoreLimit: number;
    winnerBecomesCardCzar: boolean;
    allowKickedPlayerJoin: boolean;
    allowCardCzarPopularVote: boolean;
    popularVote: boolean;
    cardPacks: CardPack[];
    selectWhiteCardTimeLimit: number;
    selectBlackCardTimeLimit: number;
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
    // Playing states
    | "active" // Default active state
    | "playing" // Picking a white card
    | "waiting" // Has played white cards, waiting for pick phase to end
    // Other states
    | "joining"
    | "pickingName"
    | "disconnected"
    | "spectating"
    | "kicked";

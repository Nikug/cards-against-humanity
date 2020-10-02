// Documentation for game object

interface Game {
    id: string,
    url: string,
    players: Player[],
    cards: Cards,
    state: GameState,
    options: Options,
    rounds: Round[]
}

interface Player {
    id: string,         
    name: string,
    state: PlayerState,
    score: number,
    isCardCzar: boolean,
    isHost: boolean,
    popularVoteScore: number,
    whiteCards: WhiteCard[]
}

interface Cards {
    whiteCards: WhiteCard[],
    blackCards: BlackCard[],
    playedWhiteCards: WhiteCard[],
    playedBlackCards: BlackCard[],
}

interface WhiteCard {
    id: string,
    url: string,
    text: string
}

interface BlackCard {
    id: string,
    url: string,
    text: string,
    whiteCardsToPlay: number,
    whiteCardsToDraw: number
}

interface Round {
    round: number,
    blackCard: BlackCard,
    whiteCardsByPlayer: {
        wonRound: boolean,
        playerId: string,
        popularVote: number,
        whiteCards: WhiteCard[]
    },
}

interface Options {
    maximumPlayers: number,
    scoreLimit: number,
    winnerBecomesCardCzar: boolean,
    cardURLs: string[],
    allowKickedPlayerJoin: boolean
}

type GameState = 
    | "lobby"
    | "pickingBlackCard"
    | "playingWhiteCards"
    | "readingCards"
    | "showingCards"
    | "roundEnd"
    | "gameOver"

type PlayerState = 
    | "pickingName"
    | "active"
    | "disconnected"
    | "spectating"
    | "kicked"
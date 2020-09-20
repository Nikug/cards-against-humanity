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
    cardURLs: string[],
    kickedPlayerJoin: boolean
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
    | "active"
    | "disconnected"
    | "joining"
    | "kicked"
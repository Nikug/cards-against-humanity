const hri = require("human-readable-ids").hri;
const nanoid = require("nanoid");

let games = [];

exports.createGame = () => {
    const gameURL = hri.random();
    const newGame = createNewGame(gameURL);
    games = [...games, newGame];
    return newGame;
}

exports.getGame = (id) => {
    const game = games.filter(game => game.id === id);
    return game.length > 0 ? game[0] : null; 
}

const createNewGame = (url) => {
    const game = {
        id: url,
        url: url,
        players: [],
        cards: null,
        state: "lobby",
        options: {
            maximumPlayers: 10,
            scoreLimit: 6,
            winnerBecomesCardCzar: false,
            cardURLs: [],
            allowKickedPlayerJoin: true
        },
        rounds: []
    }
    return game;
}

const createNewPlayer = (name) => {
    const player = {
        id: nanoid(),
        name: name,
        state: "pickingName",
        score: 0,
        isCardCzar: false,
        popularVoteScore: 0,
        whiteCards: []
    }
    return player;
}

const addCardPack = (id) => {
    const url = `https://allbad.cards/api/pack/get?pack=${id}`;
    return;
}
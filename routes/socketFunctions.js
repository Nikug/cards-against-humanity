import fetch from "node-fetch";

import {
    getGame,
    setGame,
    validateOptions,
    setPlayerName,
    joinGame,
    validateHost,
    addCardPackToGame,
    removeCardPackFromGame,
    validateGameStartRequirements,
    randomBetween,
    publicPlayersObject,
    shuffleCards,
    drawWhiteCards,
    drawBlackCards,
    validateCardCzar,
    shuffleCardsBackToDeck,
    createRound,
    validatePlayerPlayingWhiteCards,
    getPlayer,
    createWhiteCardsByPlayer,
    everyoneHasPlayedTurn,
    setPlayersPlaying,
    changeGameStateAfterTime,
} from "../modules/game.js";
import { gameOptions, playerName } from "../consts/gameSettings.js";

export const joinToGame = (socket, io, gameID) => {
    console.log(`Join game id ${gameID}`);

    const game = getGame(gameID);
    if (game !== null) {
        socket.join(gameID);
        console.log(`Client joined room ${gameID}`);

        const player = joinGame(gameID, socket.id);

        io.in(gameID).emit("update_game", { game: game.client });
        socket.emit("update_player", { player: player });
    } else {
        socket.disconnect(true);
        console.log(`Client disconnected :( ${gameID}`);
    }
};

export const updateGameOptions = (io, gameID, playerID, newOptions) => {
    const game = getGame(gameID);

    if (!game) return;
    if (!validateHost(game, playerID)) return;

    game.client.options = validateOptions({
        ...game.client.options,
        ...newOptions,
    });
    const updatedGame = setGame(game);

    io.in(game.id).emit("update_game_options", {
        options: updatedGame.client.options,
    });
};

export const updatePlayerName = (io, gameID, playerID, newName) => {
    const trimmedName = newName.trim();
    if (trimmedName.length < playerName.minimumLength) return;

    const validatedName = trimmedName.substr(0, playerName.maximumLength);

    // TODO: add sanitatization to the player names for obvious reasons
    const players = setPlayerName(gameID, playerID, validatedName);

    io.in(gameID).emit("update_players", {
        players: publicPlayersObject(players),
    });
};

export const leaveFromGame = (io, gameID, playerID) => {
    const game = getGame(gameID);
    if (!!game && !!playerID) {
        game.players = game.players.map((player) => {
            return player.id === playerID
                ? { ...player, state: "disconnected" }
                : player;
        });
        setGame(game);
        io.in(gameID).emit("update_game", { game: game.client });
    }
};

export const addCardPack = async (io, gameID, cardPackID, playerID) => {
    const url = `https://allbad.cards/api/pack/get?pack=${cardPackID}`;
    const res = await fetch(url);
    const json = await res.json();

    if (json.message === "Pack not found!") return;

    const whiteCards = json.definition.white.map((item, i) => ({
        id: `w-${cardPackID}-${i.toString()}`,
        cardPackID: cardPackID,
        text: item,
    }));
    const blackCards = json.definition.black.map((item, i) => ({
        id: `b-${cardPackID}-${i.toString()}`,
        cardPackID: cardPackID,
        text: item.content,
        whiteCardsToPlay: item.pick,
        whiteCardsToDraw: item.draw,
    }));

    const cardPack = {
        id: json.id,
        name: json.definition.pack.name,
        isNSFW: json.isNSFW,
        whiteCards: json.definition.quantity.white,
        blackCards: json.definition.quantity.black,
    };

    const newOptions = addCardPackToGame(
        gameID,
        playerID,
        cardPack,
        whiteCards,
        blackCards
    );

    if (!!newOptions) {
        io.in(gameID).emit("update_game_options", { options: newOptions });
    }
};

export const removeCardPack = (io, gameID, cardPackID, playerID) => {
    const newOptions = removeCardPackFromGame(gameID, cardPackID, playerID);
    if (!!newOptions) {
        io.in(gameID).emit("update_game_options", { options: newOptions });
    }
};

export const startGame = (io, gameID, playerID) => {
    const game = getGame(gameID);
    if (!game) return undefined;

    if (!validateHost(game, playerID)) return undefined;

    const result = validateGameStartRequirements(game);
    if (!!result.error) return result.error;

    game.stateMachine.startGame();
    game.client.state = game.stateMachine.state;

    const playerCount = game.players.length;
    game.players[randomBetween(0, playerCount - 1)].isCardCzar = true;
    game.players = setPlayersPlaying(game.players);

    io.in(gameID).emit("update_players", {
        players: publicPlayersObject(game.players),
    });

    game.cards.whiteCards = shuffleCards([...game.cards.whiteCards]);
    game.cards.blackCards = shuffleCards([...game.cards.blackCards]);

    const gameWithStartingHands = dealWhiteCards(
        io,
        game,
        gameOptions.startingWhiteCardCount
    );
    setGame(gameWithStartingHands);

    io.in(gameID).emit("update_game", { game: gameWithStartingHands.client });
};

export const dealWhiteCards = (io, game, count) => {
    const players = game.players
        .filter((player) =>
            ["active", "playing", "waiting"].includes(player.state)
        )
        .map((player) => {
            player.whiteCards = drawWhiteCards(game, count);
            io.to(player.socket).emit("update_player", { player: player });

            return player;
        });
    game.players = players;
    return game;
};

export const dealBlackCards = (socket, gameID, playerID) => {
    const game = getGame(gameID);
    if (!game) return;

    if (!validateCardCzar(game, playerID)) return;

    const blackCards = drawBlackCards(game, gameOptions.blackCardsToChooseFrom);
    socket.emit("deal_black_cards", { blackCards: blackCards });
};

export const selectBlackCard = (
    io,
    gameID,
    playerID,
    selectedCardID,
    discardedCardIDs
) => {
    const game = getGame(gameID);
    if (!game) return;

    if (!validateCardCzar(game, playerID)) return;

    if (
        !game.cards.playedBlackCards.some(
            (blackCard) => blackCard.id === selectedCardID
        )
    )
        return;

    if (discardedCardIDs.length !== gameOptions.blackCardsToChooseFrom - 1)
        return;
    const discardedCards = game.cards.playedBlackCards.filter((blackCard) =>
        discardedCardIDs.includes(blackCard.id)
    );
    if (discardedCards.length !== discardedCardIDs.length) return;

    game.cards.playedBlackCards = game.cards.playedBlackCards.filter(
        (blackCard) => !discardedCardIDs.includes(blackCard.id)
    );
    const selectedCard = game.cards.playedBlackCards.filter(
        (blackCard) => blackCard.id === selectedCardID
    );
    if (selectedCard.length !== 1) return;

    game.cards.blackCards = shuffleCardsBackToDeck(
        discardedCards,
        game.cards.blackCards
    );

    game.currentRound = createRound(
        game.client.rounds.length + 1,
        selectedCard[0],
        playerID
    );
    game.stateMachine.startPlayingWhiteCards();
    game.client.state = game.stateMachine.state;
    game.players = setPlayersPlaying(game.players);
    setGame(game);

    io.in(gameID).emit("update_game", { game: game.client });
    changeGameStateAfterTime(
        io,
        gameID,
        "startReading",
        game.client.options.selectWhiteCardTimeLimit +
            gameOptions.defaultGracePeriod
    );
};

export const playWhiteCard = (io, socket, gameID, playerID, whiteCardIDs) => {
    let game = getGame(gameID);
    if (!game) return;
    if (!validatePlayerPlayingWhiteCards(game, playerID, whiteCardIDs).result)
        return;

    const player = getPlayer(game, playerID);
    if (!player) return;

    const whiteCards = player.whiteCards.filter((whiteCard) =>
        whiteCardIDs.includes(whiteCard.id)
    );
    player.whiteCards = player.whiteCards.filter(
        (whiteCard) => !whiteCardIDs.includes(whiteCard.id)
    );

    game.cards.playedWhiteCards = [
        ...game.cards.playedWhiteCards,
        ...whiteCards,
    ];

    player.state = "waiting";
    game.players = game.players.map((oldPlayer) =>
        oldPlayer.id === player.id ? player : oldPlayer
    );

    game.currentRound.whiteCardsByPlayer = [
        ...game.currentRound.whiteCardsByPlayer,
        createWhiteCardsByPlayer(whiteCards, playerID),
    ];

    if (everyoneHasPlayedTurn(game)) {
        game.client.state = "readingCards";
    }

    setGame(game);
    io.in(gameID).emit("update_game", { game: game.client });
    io.in(gameID).emit("update_players", {
        players: publicPlayersObject(game.players),
    });
    io.to(player.socket).emit("update_player", { player: player });
};

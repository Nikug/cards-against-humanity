import {
    joinToGame,
    leaveFromGame,
    updateGameOptions,
    startGame,
} from "../modules/game.js";
import { updatePlayerName } from "../modules/player.js";
import { addCardPack, removeCardPack } from "../modules/cardpack.js";
import {
    dealBlackCards,
    selectBlackCard,
    playWhiteCards,
} from "../modules/card.js";

export const sockets = (io) => {
    io.on("connection", (socket) => {
        console.log(`Client joined! ID: ${socket.id}`);

        socket.on("join_game", (data) => {
            joinToGame(socket, io, data.gameID);
        });

        socket.on("leave_game", (data) => {
            console.log("Some dude just left");
            socket.disconnect(true);
            leaveFromGame(io, data.gameID, data.playerID);
        });

        socket.on("update_game_options", (data) => {
            updateGameOptions(io, data.gameID, data.playerID, data.options);
        });

        socket.on("set_player_name", (data) => {
            updatePlayerName(io, data.gameID, data.playerID, data.playerName);
        });

        socket.on("add_card_pack", (data) => {
            addCardPack(io, data.gameID, data.cardPackID, data.playerID);
        });

        socket.on("remove_card_pack", (data) => {
            removeCardPack(io, data.gameID, data.cardPackID, data.playerID);
        });

        socket.on("start_game", (data) => {
            startGame(io, data.gameID, data.playerID);
        });

        socket.on("draw_black_cards", (data) => {
            dealBlackCards(socket, data.gameID, data.playerID);
        });

        socket.on("select_black_card", (data) => {
            selectBlackCard(
                io,
                data.gameID,
                data.playerID,
                data.selectedCardID,
                data.discardedCardIDs
            );
        });

        socket.on("play_white_cards", (data) => {
            playWhiteCards(
                io,
                socket,
                data.gameID,
                data.playerID,
                data.whiteCardIDs
            );
        });
    });

    io.on("disconnect", (socket) => {
        console.log(`Client left :( ID: ${socket.id}`);
    });
};

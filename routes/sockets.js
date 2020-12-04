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
            if (!data.gameID) {
                sendError(socket, "Invalid data");
            } else {
                joinToGame(socket, io, data.gameID);
            }
        });

        socket.on("leave_game", (data) => {
            if (!data.gameID || !data.playerID) {
                sendError(socket, "Invalid data");
            } else {
                console.log("Some dude just left");
                socket.disconnect(true);
                leaveFromGame(io, data.gameID, data.playerID);
            }
        });

        socket.on("update_game_options", (data) => {
            if (!data.gameID || !data.playerID || !data.options) {
                sendError(socket, "Invalid data");
            } else {
                updateGameOptions(io, data.gameID, data.playerID, data.options);
            }
        });

        socket.on("set_player_name", (data) => {
            if (!data.gameID || !data.playerID || !data.playerName) {
                sendError(socket, "Invalid data");
            } else {
                updatePlayerName(
                    io,
                    data.gameID,
                    data.playerID,
                    data.playerName
                );
            }
        });

        socket.on("add_card_pack", (data) => {
            if (!data.gameID || !data.cardPackID || !data.playerID) {
                sendError(socket, "Invalid data");
            } else {
                addCardPack(io, data.gameID, data.cardPackID, data.playerID);
            }
        });

        socket.on("remove_card_pack", (data) => {
            if (!data.gameID || !data.cardPackID || !data.playerID) {
                sendError(socket, "Invalid data");
            } else {
                removeCardPack(io, data.gameID, data.cardPackID, data.playerID);
            }
        });

        socket.on("start_game", (data) => {
            if (!data.gameID || !data.playerID) {
                sendError(socket, "Invalid data");
            } else {
                startGame(io, data.gameID, data.playerID);
            }
        });

        socket.on("draw_black_cards", (data) => {
            if (!data.gameID || !data.playerID) {
                sendError(socket, "Invalid data");
            } else {
                dealBlackCards(socket, data.gameID, data.playerID);
            }
        });

        socket.on("select_black_card", (data) => {
            if (
                !data.gameID ||
                !data.playerID ||
                !data.selectedCardID ||
                !data.discardedCardIDs
            ) {
                sendError(socket, "Invalid data");
            } else {
                selectBlackCard(
                    io,
                    data.gameID,
                    data.playerID,
                    data.selectedCardID,
                    data.discardedCardIDs
                );
            }
        });

        socket.on("play_white_cards", (data) => {
            if (!data.gameID || !data.playerID || !data.whiteCardIDs) {
                sendError(socket, "Invalid data");
            } else {
                playWhiteCards(
                    io,
                    socket,
                    data.gameID,
                    data.playerID,
                    data.whiteCardIDs
                );
            }
        });
    });

    io.on("disconnect", (socket) => {
        console.log(`Client left :( ID: ${socket.id}`);
    });
};

const sendError = (socket, message) => {
    socket.emit("error", { message: message });
};

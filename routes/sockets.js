import {
    joinToGame,
    leaveFromGame,
    updateGameOptions,
    startGame,
} from "../modules/game.js";
import {
    updatePlayerName
} from "../modules/player.js";
import {
    addCardPack,
    removeCardPack
} from "../modules/cardpack.js";
import {
    dealBlackCards,
    selectBlackCard,
    playWhiteCards,
    showWhiteCard,
} from "../modules/card.js";

export const sockets = (io) => {
    io.on("connection", (socket) => {
        console.log(`Client joined! ID: ${socket.id}`);

        socket.on("join_game", (data) => {
            const missingFields = validateFields(["gameID"], data);
            if (missingFields.length > 0) {
                sendError(socket, "Invalid data");
            } else {
                joinToGame(socket, io, data.gameID);
            }
        });

        socket.on("leave_game", (data) => {
            const missingFields = validateFields(["gameID", "playerID"], data);
            if (missingFields.length > 0) {
                sendError(socket, "Invalid data");
            } else {
                console.log("Some dude just left");
                socket.disconnect(true);
                leaveFromGame(io, data.gameID, data.playerID);
            }
        });

        socket.on("update_game_options", (data) => {
            const missingFields = validateFields(
                ["gameID", "playerID", "options"],
                data
            );
            if (missingFields.length > 0) {
                sendError(socket, "Invalid data");
            } else {
                updateGameOptions(io, data.gameID, data.playerID, data.options);
            }
        });

        socket.on("set_player_name", (data) => {
            const missingFields = validateFields(
                ["gameID", "playerID", "playerName"],
                data
            );
            if (missingFields.length > 0) {
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
            const missingFields = validateFields(
                ["gameID", "cardPackID", "playerID"],
                data
            );
            if (missingFields.length > 0) {
                sendError(socket, "Invalid data");
            } else {
                addCardPack(io, data.gameID, data.cardPackID, data.playerID);
            }
        });

        socket.on("remove_card_pack", (data) => {
            const missingFields = validateFields(
                ["gameID", "playerID", "cardPackID"],
                data
            );
            if (missingFields.length > 0) {
                sendError(socket, "Invalid data");
            } else {
                removeCardPack(io, data.gameID, data.cardPackID, data.playerID);
            }
        });

        socket.on("start_game", (data) => {
            const missingFields = validateFields(["gameID", "playerID"], data);
            if (missingFields.length > 0) {
                sendError(socket, "Invalid data");
            } else {
                startGame(io, data.gameID, data.playerID);
            }
        });

        socket.on("draw_black_cards", (data) => {
            console.log(data);
            const missingFields = validateFields(["gameID", "playerID"], data);
            if (missingFields.length > 0) {
                sendError(socket, "Invalid data");
            } else {
                dealBlackCards(socket, data.gameID, data.playerID);
            }
        });

        socket.on("select_black_card", (data) => {
            const missingFields = validateFields(
                ["gameID", "playerID", "selectedCardID", "discardedCardIDs"],
                data
            );
            if (missingFields.length > 0) {
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
            const missingFields = validateFields(
                ["gameID", "playerID", "whiteCardIDs"],
                data
            );
            if (missingFields.length > 0) {
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

        socket.on("show_next_white_card", (data) => {
            const missingFields = validateFields(["gameID", "playerID"], data);
            if (missingFields.length > 0) {
                sendError(socket, "Invalid data");
            } else {
                showWhiteCard(io, data.gameID, data.playerID);
            }
        });

        socket.on("pick_winning_card", (data) => {
            const missingFields = validateFields(["gameID", "playerID", "whiteCardIDs"], data);
            if(missingFields.length > 0) {
                sendError(socket, "Invalid data");
            } else {
                // selectWinner(io, gameID, playerID, whiteCardIDs)
            }
        });
    });

    io.on("disconnect", (socket) => {
        console.log(`Client left :( Socket ID: ${socket.id}`);
    });
};

const sendError = (socket, id, message) => {
    socket.emit("error", {
        id: id,
        message: message
    });
};

const validateFields = (fields, data) => {
    return fields
        .map((field) => {
            return !data[field] ? field : null;
        })
        .filter((error) => error !== null);
};
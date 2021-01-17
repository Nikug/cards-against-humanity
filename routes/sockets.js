import {
    joinToGame,
    updateGameOptions,
    startGame,
    startNewRound,
    sendGameInfo,
    validateHostAndReturnToLobby,
} from "../modules/game.js";
import { setPlayerDisconnected, updatePlayerName } from "../modules/player.js";
import { addCardPack, removeCardPack } from "../modules/cardpack.js";
import {
    selectBlackCard,
    playWhiteCards,
    showWhiteCard,
    selectWinner,
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
                setPlayerDisconnected(io, socket.id);
                socket.disconnect(true);
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

        socket.on("change_text_to_speech", (data) => {
            const missingFields = validateFields(
                ["gameID", "playerID", "useTextToSpeech"],
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
            const missingFields = validateFields(
                ["gameID", "playerID", "whiteCardIDs"],
                data
            );
            if (missingFields.length > 0) {
                sendError(socket, "Invalid data");
            } else {
                selectWinner(io, data.gameID, data.playerID, data.whiteCardIDs);
            }
        });

        socket.on("start_round", (data) => {
            const missingFields = validateFields(["gameID", "playerID"], data);
            if (missingFields.length > 0) {
                sendError(socket, "Invalid data");
            } else {
                startNewRound(io, data.gameID, data.playerID);
            }
        });

        socket.on("get_initial_data", (data) => {
            const missingFields = validateFields(["playerID"], data);
            if (missingFields.length > 0) {
                sendError(socket, "Invalid data");
            } else {
                sendGameInfo(io, data.playerID, socket.id);
            }
        });

        socket.on("return_to_lobby", (data) => {
            const missingFields = validateFields(["gameID", "playerID"], data);
            if (missingFields.length > 0) {
                sendError(socket, "Invalid data");
            } else {
                validateHostAndReturnToLobby(io, data.gameID, data.playerID);
            }
        });
    });

    io.on("disconnect", (socket) => {
        console.log(`Client left :( Socket ID: ${socket.id}`);
        setPlayerDisconnected(io, socket.id);
    });
};

const sendError = (socket, id, message) => {
    socket.emit("error", {
        id: id,
        message: message,
    });
};

const validateFields = (fields, data) => {
    return fields
        .map((field) => {
            return data[field] != null ? field : null;
        })
        .filter((error) => error !== null);
};

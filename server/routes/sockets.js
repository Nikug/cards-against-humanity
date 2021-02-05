import {
    updateGameOptions,
    startGame,
    startNewRound,
    validateHostAndReturnToLobby,
} from "../modules/game.js";
import {
    setPlayerDisconnected,
    updatePlayerName,
    changePlayerTextToSpeech,
} from "../modules/player.js";
import { addCardPack, removeCardPack } from "../modules/cardpack.js";
import {
    selectBlackCard,
    playWhiteCards,
    showWhiteCard,
    selectWinner,
} from "../modules/card.js";
import { popularVote } from "../modules/popularVote.js";
import { joinGame } from "../modules/join.js";

export const sockets = (io) => {
    io.on("connection", (socket) => {
        console.log(`Client joined! socket ID: ${socket.id}`);

        socket.on("join_game", (data) => {
            joinGame(io, socket, data?.gameID, data?.playerID);
        });

        socket.on("leave_game", (data) => {
            const missingFields = validateFields(["gameID", "playerID"], data);
            if (missingFields.length > 0) {
                sendError(socket, "Invalid data", missingFields);
            } else {
                setPlayerDisconnected(io, socket.id, true);
                socket.disconnect(true);
            }
        });

        socket.on("update_game_options", (data) => {
            const missingFields = validateFields(
                ["gameID", "playerID", "options"],
                data
            );
            if (missingFields.length > 0) {
                sendError(socket, "Invalid data", missingFields);
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
                sendError(socket, "Invalid data", missingFields);
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
                sendError(socket, "Invalid data", missingFields);
            } else {
                changePlayerTextToSpeech(
                    io,
                    data.gameID,
                    data.playerID,
                    data.useTextToSpeech
                );
            }
        });

        socket.on("add_card_pack", (data) => {
            const missingFields = validateFields(
                ["gameID", "cardPackID", "playerID"],
                data
            );
            if (missingFields.length > 0) {
                sendError(socket, "Invalid data", missingFields);
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
                sendError(socket, "Invalid data", missingFields);
            } else {
                removeCardPack(io, data.gameID, data.cardPackID, data.playerID);
            }
        });

        socket.on("start_game", (data) => {
            const missingFields = validateFields(["gameID", "playerID"], data);
            if (missingFields.length > 0) {
                sendError(socket, "Invalid data", missingFields);
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
                sendError(socket, "Invalid data", missingFields);
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
                sendError(socket, "Invalid data", missingFields);
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
                sendError(socket, "Invalid data", missingFields);
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
                sendError(socket, "Invalid data", missingFields);
            } else {
                selectWinner(io, data.gameID, data.playerID, data.whiteCardIDs);
            }
        });

        socket.on("start_round", (data) => {
            const missingFields = validateFields(["gameID", "playerID"], data);
            if (missingFields.length > 0) {
                sendError(socket, "Invalid data", missingFields);
            } else {
                startNewRound(io, data.gameID, data.playerID);
            }
        });

        socket.on("get_initial_data", () => {
            socket.emit(
                "initial_data",
                "Get initial data is no longer used, use join_game instead"
            );
        });

        socket.on("return_to_lobby", (data) => {
            const missingFields = validateFields(["gameID", "playerID"], data);
            if (missingFields.length > 0) {
                sendError(socket, "Invalid data", missingFields);
            } else {
                validateHostAndReturnToLobby(io, data.gameID, data.playerID);
            }
        });

        socket.on("give_popular_vote", (data) => {
            const missingFields = validateFields(
                ["gameID", "playerID", "whiteCardIDs"],
                data
            );
            if (missingFields.length > 0) {
                sendError(socket, "Invalid data", missingFields);
            } else {
                popularVote(
                    io,
                    socket,
                    data.gameID,
                    data.playerID,
                    data.whiteCardIDs
                );
            }
        });

        socket.on("disconnect", (reason) => {
            console.log(`Client left: ${reason}, Socket ID: ${socket.id}`);
            setPlayerDisconnected(io, socket.id, false);
        });
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
            return data[field] == null ? field : null;
        })
        .filter((error) => error !== null);
};

import { addCardPack, removeCardPack } from "../modules/cardpack.js";
import {
    changePlayerTextToSpeech,
    updatePlayerName,
} from "../modules/player.js";
import {
    playWhiteCards,
    selectBlackCard,
    selectWinner,
    sendBlackCards,
    showWhiteCard,
} from "../modules/card.js";
import {
    startGame,
    startNewRound,
    updateGameOptions,
    validateHostAndReturnToLobby,
} from "../modules/game.js";

import { hostKick } from "../modules/kick.js";
import { joinGame } from "../modules/join.js";
import { popularVote } from "../modules/popularVote.js";
import { setPlayerDisconnected } from "../modules/disconnect.js";
import { togglePlayerMode } from "../modules/togglePlayerMode.js";
import { updateAvatar } from "../modules/avatar.js";

export const sockets = (io) => {
    io.on("connection", (socket) => {
        console.log(`Client joined! socket ID: ${socket.id}`);

        socket.on("join_game", (data) => {
            joinGame(io, socket, data?.gameID, data?.playerID);
        });

        socket.on("disconnect", (reason) => {
            if (reason === "server namespace disconnect") return;
            console.log(`Client left: ${reason}, Socket ID: ${socket.id}`);
            setPlayerDisconnected(io, socket.id, false);
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

        socket.on("set_player_avatar", (data) => {
            const missingFields = validateFields(
                ["gameID", "playerID", "avatar"],
                data
            );
            if (missingFields.length > 0) {
                sendError(socket, "Invalid data", missingFields);
            } else {
                updateAvatar(io, data.gameID, data.playerID, data.avatar);
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

        socket.on("draw_black_cards", (data) => {
            const missingFields = validateFields(["gameID", "playerID"], data);
            if (missingFields.length > 0) {
                sendError(socket, "Invalid data", missingFields);
            } else {
                sendBlackCards(socket, data.gameID, data.playerID);
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

        socket.on("toggle_player_mode", (data) => {
            const missingFields = validateFields(["gameID", "playerID"], data);
            if (missingFields.length > 0) {
                sendError(socket, "Invalid data", missingFields);
            } else {
                togglePlayerMode(io, data.gameID, data.playerID);
            }
        });

        socket.on("kick_player", (data) => {
            const missingFields = validateFields(
                ["gameID", "playerID", "targetID", "removeFromGame"],
                data
            );
            if (missingFields.length > 0) {
                sendError(socket, "Invalid data", missingFields);
            } else {
                hostKick(
                    io,
                    data.gameID,
                    data.playerID,
                    data.targetID,
                    data.removeFromGame
                );
            }
        });
    });
};

const sendError = (socket, id, message) => {
    socket?.emit("notification", {
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

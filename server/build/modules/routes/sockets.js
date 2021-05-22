"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sockets = void 0;
const error_1 = require("../../consts/error");
const cardpack_1 = require("../cards/cardpack");
const playerTextToSpeech_1 = require("../players/playerTextToSpeech");
const kick_1 = require("../connections/kick");
const join_1 = require("../connections/join");
const playWhiteCards_1 = require("../cards/playWhiteCards");
const popularVote_1 = require("../cards/popularVote");
const selectBlackCard_1 = require("../cards/selectBlackCard");
const selectWinner_1 = require("../rounds/selectWinner");
const drawCards_1 = require("../cards/drawCards");
const socket_1 = require("../utilities/socket");
const disconnect_1 = require("../connections/disconnect");
const showWhiteCard_1 = require("../rounds/showWhiteCard");
const startGame_1 = require("../games/startGame");
const startRound_1 = require("../rounds/startRound");
const togglePlayerMode_1 = require("../players/togglePlayerMode");
const util_1 = require("../db/util");
const avatar_1 = require("../players/avatar");
const gameOptions_1 = require("../games/gameOptions");
const playerName_1 = require("../players/playerName");
const returnToLobby_1 = require("../rounds/returnToLobby");
const sockets = (io) => {
    io.on("connection", (socket) => {
        console.log(`Client joined! socket ID: ${socket.id}`);
        socket.on("join_game", async (data) => {
            util_1.transactionize(join_1.joinGame, [
                io,
                socket,
                data?.gameID,
                data?.playerID,
                data?.password,
            ]);
        });
        socket.on("disconnect", (reason) => {
            if (reason === "server namespace disconnect")
                return;
            console.log(`Client left: ${reason}, Socket ID: ${socket.id}`);
            util_1.transactionize(disconnect_1.setPlayerDisconnected, [io, socket.id, false]);
        });
        socket.on("leave_game", async (data) => {
            if (validateFields(socket, ["gameID", "playerID"], data)) {
                await util_1.transactionize(disconnect_1.setPlayerDisconnected, [
                    io,
                    socket.id,
                    true,
                ]);
                socket.disconnect(true);
            }
        });
        socket.on("update_game_options", (data) => {
            if (validateFields(socket, ["gameID", "playerID", "options"], {
                ...data,
            })) {
                util_1.transactionize(gameOptions_1.updateGameOptions, [
                    io,
                    socket,
                    data.gameID,
                    data.playerID,
                    data.options,
                ]);
            }
        });
        socket.on("set_player_name", (data) => {
            if (validateFields(socket, ["gameID", "playerID", "playerName"], data)) {
                util_1.transactionize(playerName_1.updatePlayerName, [
                    io,
                    data.gameID,
                    data.playerID,
                    data.playerName,
                ]);
            }
        });
        socket.on("set_player_avatar", (data) => {
            if (validateFields(socket, ["gameID", "playerID", "avatar"], data)) {
                util_1.transactionize(avatar_1.updateAvatar, [
                    io,
                    data.gameID,
                    data.playerID,
                    data.avatar,
                ]);
            }
        });
        socket.on("change_text_to_speech", (data) => {
            if (validateFields(socket, ["gameID", "playerID", "useTextToSpeech"], data)) {
                util_1.transactionize(playerTextToSpeech_1.changePlayerTextToSpeech, [
                    io,
                    data.gameID,
                    data.playerID,
                    data.useTextToSpeech,
                ]);
            }
        });
        socket.on("add_card_pack", (data) => {
            if (validateFields(socket, ["gameID", "cardPackID", "playerID"], data)) {
                util_1.transactionize(cardpack_1.addCardPack, [
                    io,
                    socket,
                    data.gameID,
                    data.cardPackID,
                    data.playerID,
                ]);
            }
        });
        socket.on("remove_card_pack", (data) => {
            if (validateFields(socket, ["gameID", "playerID", "cardPackID"], data)) {
                util_1.transactionize(cardpack_1.removeCardPack, [
                    io,
                    socket,
                    data.gameID,
                    data.cardPackID,
                    data.playerID,
                ]);
            }
        });
        socket.on("start_game", (data) => {
            if (validateFields(socket, ["gameID", "playerID"], data)) {
                util_1.transactionize(startGame_1.startGame, [
                    io,
                    socket,
                    data.gameID,
                    data.playerID,
                ]);
            }
        });
        socket.on("draw_black_cards", (data) => {
            if (validateFields(socket, ["gameID", "playerID"], data)) {
                util_1.transactionize(drawCards_1.sendBlackCards, [
                    socket,
                    data.gameID,
                    data.playerID,
                ]);
            }
        });
        socket.on("select_black_card", (data) => {
            if (validateFields(socket, [
                "gameID",
                "playerID",
                "selectedCardID",
                "discardedCardIDs",
            ], data)) {
                util_1.transactionize(selectBlackCard_1.selectBlackCard, [
                    io,
                    socket,
                    data.gameID,
                    data.playerID,
                    data.selectedCardID,
                    data.discardedCardIDs,
                ]);
            }
        });
        socket.on("play_white_cards", (data) => {
            if (validateFields(socket, ["gameID", "playerID", "whiteCardIDs"], data)) {
                util_1.transactionize(playWhiteCards_1.playWhiteCards, [
                    io,
                    socket,
                    data.gameID,
                    data.playerID,
                    data.whiteCardIDs,
                ]);
            }
        });
        socket.on("show_next_white_card", (data) => {
            if (validateFields(socket, ["gameID", "playerID"], data)) {
                util_1.transactionize(showWhiteCard_1.showWhiteCard, [
                    io,
                    socket,
                    data.gameID,
                    data.playerID,
                ]);
            }
        });
        socket.on("pick_winning_card", (data) => {
            if (validateFields(socket, ["gameID", "playerID", "whiteCardIDs"], data)) {
                util_1.transactionize(selectWinner_1.selectWinner, [
                    io,
                    socket,
                    data.gameID,
                    data.playerID,
                    data.whiteCardIDs,
                ]);
            }
        });
        socket.on("start_round", (data) => {
            if (validateFields(socket, ["gameID", "playerID"], data)) {
                util_1.transactionize(startRound_1.startNewRound, [
                    io,
                    socket,
                    data.gameID,
                    data.playerID,
                ]);
            }
        });
        socket.on("return_to_lobby", (data) => {
            if (validateFields(socket, ["gameID", "playerID"], data)) {
                util_1.transactionize(returnToLobby_1.validateHostAndReturnToLobby, [
                    io,
                    socket,
                    data.gameID,
                    data.playerID,
                ]);
            }
        });
        socket.on("give_popular_vote", (data) => {
            if (validateFields(socket, ["gameID", "playerID", "whiteCardIDs"], data)) {
                util_1.transactionize(popularVote_1.popularVote, [
                    io,
                    socket,
                    data.gameID,
                    data.playerID,
                    data.whiteCardIDs,
                ]);
            }
        });
        socket.on("toggle_player_mode", (data) => {
            if (validateFields(socket, ["gameID", "playerID"], data)) {
                util_1.transactionize(togglePlayerMode_1.togglePlayerMode, [
                    io,
                    socket,
                    data.gameID,
                    data.playerID,
                ]);
            }
        });
        socket.on("kick_player", (data) => {
            if (validateFields(socket, ["gameID", "playerID", "targetID", "removeFromGame"], data)) {
                util_1.transactionize(kick_1.hostKick, [
                    io,
                    socket,
                    data.gameID,
                    data.playerID,
                    data.targetID,
                    data.removeFromGame,
                ]);
            }
        });
    });
};
exports.sockets = sockets;
const sendError = (socket, data) => {
    socket_1.sendNotification(`${error_1.ERROR_TYPES.missingFields}: ${data}`, error_1.NOTIFICATION_TYPES.error, {
        socket: socket,
    });
};
const validateFields = (socket, fields, data) => {
    const missingFields = fields
        .map((field) => {
        return data[field] == null ? field : null;
    })
        .filter((error) => error !== null);
    if (missingFields.length > 0) {
        sendError(socket, missingFields);
        return false;
    }
    else {
        return true;
    }
};

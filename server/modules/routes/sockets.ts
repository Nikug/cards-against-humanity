import { ERROR_TYPES, NOTIFICATION_TYPES } from "../../consts/error";
import { addCardPack, removeCardPack } from "../cards/cardpack";

import type SocketIO from "socket.io";
import { changePlayerTextToSpeech } from "../players/playerTextToSpeech";
import { hostKick } from "../connections/kick";
import { joinGame } from "../connections/join";
import { playWhiteCards } from "../cards/playWhiteCards";
import { popularVote } from "../cards/popularVote";
import { selectBlackCard } from "../cards/selectBlackCard";
import { selectWinner } from "../rounds/selectWinner";
import { sendBlackCards } from "../cards/drawCards";
import { sendNotification } from "../utilities/socket";
import { setPlayerDisconnected } from "../connections/disconnect";
import { showWhiteCard } from "../rounds/showWhiteCard";
import { startGame } from "../games/startGame";
import { startNewRound } from "../rounds/startRound";
import { togglePlayerMode } from "../players/togglePlayerMode";
import { transactionize } from "../db/util";
import { updateAvatar } from "../players/avatar";
import { updateGameOptions } from "../games/gameOptions";
import { updatePlayerName } from "../players/playerName";
import { validateHostAndReturnToLobby } from "../rounds/returnToLobby";

export const sockets = (io: SocketIO.Server) => {
    io.on("connection", (socket) => {
        console.log(`Client joined! socket ID: ${socket.id}`);

        socket.on("join_game", async (data: any) => {
            transactionize(joinGame, [
                io,
                socket,
                data?.gameID,
                data?.playerID,
                data?.password,
            ]);
        });

        socket.on("disconnect", (reason: string) => {
            if (reason === "server namespace disconnect") return;
            console.log(`Client left: ${reason}, Socket ID: ${socket.id}`);
            transactionize(setPlayerDisconnected, [io, socket.id, false]);
        });

        socket.on("leave_game", async (data: any) => {
            if (validateFields(socket, ["gameID", "playerID"], data)) {
                await transactionize(setPlayerDisconnected, [
                    io,
                    socket.id,
                    true,
                ]);
                socket.disconnect(true);
            }
        });

        socket.on("update_game_options", (data: any) => {
            if (
                validateFields(socket, ["gameID", "playerID", "options"], {
                    ...data,
                })
            ) {
                transactionize(updateGameOptions, [
                    io,
                    socket,
                    data.gameID,
                    data.playerID,
                    data.options,
                ]);
            }
        });

        socket.on("set_player_name", (data: any) => {
            if (
                validateFields(
                    socket,
                    ["gameID", "playerID", "playerName"],
                    data
                )
            ) {
                transactionize(updatePlayerName, [
                    io,
                    data.gameID,
                    data.playerID,
                    data.playerName,
                ]);
            }
        });

        socket.on("set_player_avatar", (data: any) => {
            if (
                validateFields(socket, ["gameID", "playerID", "avatar"], data)
            ) {
                transactionize(updateAvatar, [
                    io,
                    data.gameID,
                    data.playerID,
                    data.avatar,
                ]);
            }
        });

        socket.on("change_text_to_speech", (data: any) => {
            if (
                validateFields(
                    socket,
                    ["gameID", "playerID", "useTextToSpeech"],
                    data
                )
            ) {
                transactionize(changePlayerTextToSpeech, [
                    io,
                    data.gameID,
                    data.playerID,
                    data.useTextToSpeech,
                ]);
            }
        });

        socket.on("add_card_pack", (data: any) => {
            if (
                validateFields(
                    socket,
                    ["gameID", "cardPackID", "playerID"],
                    data
                )
            ) {
                transactionize(addCardPack, [
                    io,
                    socket,
                    data.gameID,
                    data.cardPackID,
                    data.playerID,
                ]);
            }
        });

        socket.on("remove_card_pack", (data: any) => {
            if (
                validateFields(
                    socket,
                    ["gameID", "playerID", "cardPackID"],
                    data
                )
            ) {
                transactionize(removeCardPack, [
                    io,
                    socket,
                    data.gameID,
                    data.cardPackID,
                    data.playerID,
                ]);
            }
        });

        socket.on("start_game", (data: any) => {
            if (validateFields(socket, ["gameID", "playerID"], data)) {
                transactionize(startGame, [
                    io,
                    socket,
                    data.gameID,
                    data.playerID,
                ]);
            }
        });

        socket.on("draw_black_cards", (data: any) => {
            if (validateFields(socket, ["gameID", "playerID"], data)) {
                transactionize(sendBlackCards, [
                    socket,
                    data.gameID,
                    data.playerID,
                ]);
            }
        });

        socket.on("select_black_card", (data: any) => {
            if (
                validateFields(
                    socket,
                    [
                        "gameID",
                        "playerID",
                        "selectedCardID",
                        "discardedCardIDs",
                    ],
                    data
                )
            ) {
                transactionize(selectBlackCard, [
                    io,
                    socket,
                    data.gameID,
                    data.playerID,
                    data.selectedCardID,
                    data.discardedCardIDs,
                ]);
            }
        });

        socket.on("play_white_cards", (data: any) => {
            if (
                validateFields(
                    socket,
                    ["gameID", "playerID", "whiteCardIDs"],
                    data
                )
            ) {
                transactionize(playWhiteCards, [
                    io,
                    socket,
                    data.gameID,
                    data.playerID,
                    data.whiteCardIDs,
                ]);
            }
        });

        socket.on("show_next_white_card", (data: any) => {
            if (validateFields(socket, ["gameID", "playerID"], data)) {
                transactionize(showWhiteCard, [
                    io,
                    socket,
                    data.gameID,
                    data.playerID,
                ]);
            }
        });

        socket.on("pick_winning_card", (data: any) => {
            if (
                validateFields(
                    socket,
                    ["gameID", "playerID", "whiteCardIDs"],
                    data
                )
            ) {
                transactionize(selectWinner, [
                    io,
                    socket,
                    data.gameID,
                    data.playerID,
                    data.whiteCardIDs,
                ]);
            }
        });

        socket.on("start_round", (data: any) => {
            if (validateFields(socket, ["gameID", "playerID"], data)) {
                transactionize(startNewRound, [
                    io,
                    socket,
                    data.gameID,
                    data.playerID,
                ]);
            }
        });

        socket.on("return_to_lobby", (data: any) => {
            if (validateFields(socket, ["gameID", "playerID"], data)) {
                transactionize(validateHostAndReturnToLobby, [
                    io,
                    socket,
                    data.gameID,
                    data.playerID,
                ]);
            }
        });

        socket.on("give_popular_vote", (data: any) => {
            if (
                validateFields(
                    socket,
                    ["gameID", "playerID", "whiteCardIDs"],
                    data
                )
            ) {
                transactionize(popularVote, [
                    io,
                    socket,
                    data.gameID,
                    data.playerID,
                    data.whiteCardIDs,
                ]);
            }
        });

        socket.on("toggle_player_mode", (data: any) => {
            if (validateFields(socket, ["gameID", "playerID"], data)) {
                transactionize(togglePlayerMode, [
                    io,
                    socket,
                    data.gameID,
                    data.playerID,
                ]);
            }
        });

        socket.on("kick_player", (data: any) => {
            if (
                validateFields(
                    socket,
                    ["gameID", "playerID", "targetID", "removeFromGame"],
                    data
                )
            ) {
                transactionize(hostKick, [
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

const sendError = (socket: SocketIO.Socket, data: any) => {
    sendNotification(
        `${ERROR_TYPES.missingFields}: ${data}`,
        NOTIFICATION_TYPES.error,
        {
            socket: socket,
        }
    );
};

const validateFields = (
    socket: SocketIO.Socket,
    fields: string[],
    data: any
) => {
    const missingFields = fields
        .map((field) => {
            return data[field] == null ? field : null;
        })
        .filter((error) => error !== null);

    if (missingFields.length > 0) {
        sendError(socket, missingFields);
        return false;
    } else {
        return true;
    }
};

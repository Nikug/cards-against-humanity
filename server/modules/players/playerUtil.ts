import * as CAH from "types";
import * as SocketIO from "socket.io";

import { emitToAllPlayerSockets } from "./emitPlayers";
import { gameOptions } from "../../consts/gameSettings";
import { publicPlayersObject } from "../utilities/anonymize";

export const everyoneHasPlayedTurn = (game: CAH.Game) => {
    const waitingPlayers = game.players.filter(
        (player) => player.state === "waiting" && !player.isCardCzar
    );
    return waitingPlayers.length === getActivePlayers(game.players).length - 1; // Remove card czar with -1
};

export const getCardCzar = (players: CAH.Player[]) =>
    players.find((player) => player.isCardCzar);

export const punishCardCzar = (game: CAH.Game) => {
    return game.players.map((player) => {
        if (player.isCardCzar && game.stateMachine.state !== "roundEnd") {
            player.score -= gameOptions.notSelectingWinnerPunishment;
        }
        return player;
    });
};

export const findPlayer = (
    players: CAH.Player[],
    playerID: string | null | undefined
) => {
    return players.find((player) => player.id === playerID);
};

export const addPlayer = (players: CAH.Player[], player: CAH.Player) => {
    return [...players, player];
};

export const setPlayer = (players: CAH.Player[], newPlayer: CAH.Player) => {
    return players.map((player) =>
        player.id === newPlayer.id ? newPlayer : player
    );
};

export const setPlayerState = (
    players: CAH.Player[],
    playerID: string,
    state: CAH.PlayerState
) => {
    return players.map((player) =>
        player.id === playerID
            ? {
                  ...player,
                  state: state,
              }
            : player
    );
};

export const getPlayerByPublicID = (
    players: CAH.Player[],
    targetID: string
) => {
    return players.find((player) => player.publicID === targetID);
};

export const filterByPublicID = (players: CAH.Player[], targetID: string) => {
    return players.filter((player) => player.publicID !== targetID);
};

export const getRoundWinner = (round: CAH.Round) => {
    if (!round?.whiteCardsByPlayer) return undefined;

    const cards = round.whiteCardsByPlayer.find((cards) => cards.wonRound);
    return cards?.playerID;
};

export const getActivePlayers = (players: CAH.Player[]) => {
    return players.filter((player) =>
        ["active", "playing", "waiting"].includes(player.state)
    );
};

export const getPlayersWithState = (
    players: CAH.Player[],
    state: CAH.PlayerState
) => {
    return players.filter((player) => player.state === state);
};

export const getActiveAndJoiningPlayers = (players: CAH.Player[]) => {
    return players.filter((player) =>
        ["active", "playing", "waiting", "joining"].includes(player.state)
    );
};

export const getAllActivePlayers = (players: CAH.Player[]) =>
    players.filter((player) =>
        ["active", "playing", "waiting", "pickingName"].includes(player.state)
    );

export const getAllButDisconnectedPlayers = (players: CAH.Player[]) =>
    players.filter((player) => player.state !== "disconnected");

export const getPlayerByWhiteCards = (
    game: CAH.Game,
    whiteCardIDs: string[]
) => {
    if (!game.currentRound) return undefined;

    const players = game.currentRound.whiteCardsByPlayer.filter(
        (whiteCardByPlayer) => {
            if (whiteCardIDs.length !== whiteCardByPlayer.whiteCards.length)
                return false;

            const ids = whiteCardByPlayer.whiteCards.map(
                (whiteCard) => whiteCard.id
            );
            return !whiteCardIDs.some((id) => !ids.includes(id));
        }
    );

    // There should always be exactly one player
    // No more, no less
    return players.length === 1 ? players[0].playerID : undefined;
};

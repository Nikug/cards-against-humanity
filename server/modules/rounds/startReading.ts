import * as CAH from "types";
import * as SocketIO from "socket.io";
import * as pg from "pg";

import { changeGameStateAfterTime } from "../utilities/delayedStateChange";
import { setGame } from "../games/gameUtil";
import { shuffleCards } from "../cards/shuffleCards";
import { updatePlayersIndividually } from "../players/emitPlayers";

export const startReading = async (
    io: SocketIO.Server,
    game: CAH.Game,
    client?: pg.PoolClient
) => {
    game.stateMachine.startReading();
    game.client.state = game.stateMachine.state;
    game.currentRound!.whiteCardsByPlayer = shuffleCards([
        ...game.currentRound!.whiteCardsByPlayer,
    ]);
    const updatedGame = changeGameStateAfterTime(io, game, "showCards");
    await setGame(updatedGame, client);
    updatePlayersIndividually(io, updatedGame);
};

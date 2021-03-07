import React from "react";
import { useGameContext } from "../../../../contexts/GameContext";
import { isPlayerSpectator } from "../../../../helpers/player-helpers";

export const SpectatorsInfo = () => {
    const { game, player } = useGameContext();

    const isSpectator = isPlayerSpectator(player);
    const spectatorCount = game?.players.filter((player) =>
        isPlayerSpectator(player)
    ).length;

    return (
        <div className="spectator-info">
            {spectatorCount > 0 && (
                <div className="anchor">
                    <div className="spectators">Katsojia: {spectatorCount}</div>
                </div>
            )}
            {isSpectator && (
                <div className="anchor">
                    <div className="spectator-indicator">Olet katsomossa</div>
                </div>
            )}
        </div>
    );
};

import React from 'react';
import { isPlayerSpectator } from '../../../../helpers/player-helpers';
import { translateCommon } from '../../../../helpers/translation-helpers';
import { useGameContext } from '../../../../contexts/GameContext';
import { useTranslation } from 'react-i18next';

export const SpectatorsInfo = () => {
    const { t } = useTranslation();
    const { game, player } = useGameContext();

    const isSpectator = isPlayerSpectator(player);
    const spectatorCount = game?.players.filter((player) => isPlayerSpectator(player)).length;

    return (
        <div className="spectator-info">
            <div className="spectators">
                {translateCommon('spectators', t)}: {spectatorCount}
            </div>
            {isSpectator && <div className="spectator-indicator">{translateCommon('youAreInTheAudience', t)}</div>}
        </div>
    );
};

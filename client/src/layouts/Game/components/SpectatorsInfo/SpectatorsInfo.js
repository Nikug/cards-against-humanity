import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { translateCommon } from '../../../../helpers/translation-helpers';
import { playersListSpectatorsSelector } from '../../../../selectors/playersListSelectors';
import { playerIsSpectatorSelector } from '../../../../selectors/playerSelectors';

export const SpectatorsInfo = () => {
    const { t } = useTranslation();

    const spectators = useSelector(playersListSpectatorsSelector) || [];
    const isSpectator = useSelector(playerIsSpectatorSelector);

    const spectatorCount = spectators.length;

    return (
        <div className="spectator-info">
            <div className="spectators">
                {translateCommon('spectators', t)}: {spectatorCount}
            </div>
            {isSpectator && <div className="spectator-indicator">{translateCommon('youAreInTheAudience', t)}</div>}
        </div>
    );
};

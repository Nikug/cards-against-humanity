import React from 'react';
import { useTranslation } from 'react-i18next';
import { translateCommon } from '../../../helpers/translation-helpers';

export const WinnerText = ({ name, cardCzarName }) => {
    const { t } = useTranslation();

    const text = name
        ? translateCommon('_player_WonTheRound', t, { player: name })
        : translateCommon('_player_DidNotChooseAWinnerAndLostOnePoint', t, { player: cardCzarName });

    return (
        <div className="winner-text">
            <span className="emoji first">🎉</span>
            <span className="text">{text}</span>
            <span className="emoji last">🎉</span>
        </div>
    );
};

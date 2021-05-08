import { BUTTON_TYPES, Button } from '../../../../components/general/Button.jsx';

import React from 'react';
import { translateCommon } from '../../../../helpers/translation-helpers';
import { useTranslation } from 'react-i18next';

export const StartGameButton = ({ disableStartGameButton, game, player, startGame }) => {
    const { t } = useTranslation();

    return (
        <Button
            additionalClassname={'big-btn'}
            callback={() => startGame(game?.id, player?.id)}
            disabled={disableStartGameButton || player?.isHost !== true}
            fill={'fill-horizontal'}
            icon={'play_circle_filled'}
            iconPosition={'after'}
            text={translateCommon('startGame', t)}
            type={BUTTON_TYPES.GREEN}
        />
    );
};

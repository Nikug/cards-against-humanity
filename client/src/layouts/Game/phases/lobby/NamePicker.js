import { CONTROL_TYPES, Setting } from '../../../../components/settings/setting';

import React from 'react';
import { useSelector } from 'react-redux';
import { translateCommon } from '../../../../helpers/translation-helpers';
import { useTranslation } from 'react-i18next';
import { socket } from '../../../../components/sockets/socket';
import { playerSelector } from '../../../../selectors/playerSelectors';
import { gameSelector } from '../../../../selectors/gameSelectors';

export const ICON_CLASSNAMES = 'icon-margin-right';
const NAME_CHAR_LIMIT = 50;

export const NamePicker = () => {
    const { t } = useTranslation();
    const player = useSelector(playerSelector);
    const game = useSelector(gameSelector);

    const setPlayerName = (name) => {
        const cleanedName = name.trim();

        if (!!player?.id && cleanedName.length > 0) {
            socket.emit('set_player_name', {
                gameID: game?.id,
                playerID: player?.id,
                playerName: cleanedName,
            });
        }
    };

    return (
        <div className="nickname-selector">
            <Setting
                text={translateCommon('nickname', t)}
                placeholderText={translateCommon('nickname', t).toLowerCase()}
                controlType={CONTROL_TYPES.textWithConfirm}
                onChangeCallback={setPlayerName}
                icon={{
                    name: 'person',
                    className: ICON_CLASSNAMES,
                }}
                charLimit={NAME_CHAR_LIMIT}
                customButtonIcon={'login'}
            />
        </div>
    );
};

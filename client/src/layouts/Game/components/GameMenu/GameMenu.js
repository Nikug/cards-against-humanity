import { isPlayerHost, isPlayerSpectator } from '../../../../helpers/player-helpers';

import { ActionButtonRow } from './ActionButtonRow';
import { BUTTON_TYPES } from '../../../../components/general/Button.jsx';
import { GAME_STATES } from '../../../../consts/gamestates';
import { PopOverMenu } from '../../../../components/popover-menu/PopoverMenu';
import React from 'react';
import { SocketMessenger } from '../../../../components/socket-messenger/socket-messenger';
import { translateCommon } from '../../../../helpers/translation-helpers';
import { useGameContext } from '../../../../contexts/GameContext';
import { useTranslation } from 'react-i18next';

export const GameMenu = ({ callbacks: { togglePlayerMode, returnBackToLobby, openGameSettings, openHistory }, showDebug }) => {
    const { t } = useTranslation();
    const { game, player } = useGameContext();

    const isLobby = game?.state === GAME_STATES.LOBBY;
    const isSpectator = isPlayerSpectator(player);

    return (
        <>
            <PopOverMenu
                buttonProps={{ icon: 'menu' }}
                content={
                    <>
                        {translateCommon('menu', t)}
                        <ActionButtonRow
                            buttons={[
                                isSpectator
                                    ? {
                                          icon: 'login',
                                          text: translateCommon('joinToGame', t),
                                          callback: togglePlayerMode,
                                          type: BUTTON_TYPES.PRIMARY,
                                      }
                                    : {
                                          icon: 'groups',
                                          text: translateCommon('goToAudience', t),
                                          callback: togglePlayerMode,
                                          type: BUTTON_TYPES.PRIMARY,
                                      },
                                {
                                    icon: 'home',
                                    text: translateCommon('returnToLobby', t),
                                    callback: returnBackToLobby,
                                    type: BUTTON_TYPES.PRIMARY,
                                    disabled: !isPlayerHost(player) || isLobby,
                                },
                                {
                                    icon: 'settings',
                                    text: translateCommon('gameSettings', t),
                                    callback: openGameSettings,
                                    type: BUTTON_TYPES.PRIMARY,
                                },
                                {
                                    icon: 'history',
                                    text: translateCommon('history', t),
                                    callback: openHistory,
                                    type: BUTTON_TYPES.PRIMARY,
                                    disabled: !(game?.rounds?.length > 0),
                                },
                            ]}
                        />
                    </>
                }
            />
            {showDebug && <PopOverMenu buttonProps={{ icon: 'menu', text: 'Debug' }} content={<SocketMessenger gameID={game?.id} playerID={player?.id} />} />}
        </>
    );
};

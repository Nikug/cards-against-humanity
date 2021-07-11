import { isPlayerCardCzar, isPlayerHost, isPlayerSpectator, isPlayerSpectatorOrJoining } from '../../../../helpers/player-helpers';

import { ActionButtonRow, BUTTON_ROW_DIRECTION } from './ActionButtonRow';
import { Button, BUTTON_TYPES } from '../../../../components/general/Button.jsx';
import { GAME_STATES } from '../../../../consts/gamestates';
import { PopOverMenu } from '../../../../components/popover-menu/PopoverMenu';
import React from 'react';
import { SocketMessenger } from '../../../../components/socket-messenger/socket-messenger';
import { translateCommon, translateUnderWork } from '../../../../helpers/translation-helpers';
import { useGameContext } from '../../../../contexts/GameContext';
import { useTranslation } from 'react-i18next';
import Tippy from '@tippyjs/react';

export const GameMenu = ({ callbacks: { togglePlayerMode, changeCards, returnBackToLobby, openGameSettings, openHistory } }) => {
    const { t } = useTranslation();
    const { game, player } = useGameContext();

    const isLobby = game?.state === GAME_STATES.LOBBY;
    const isSpectator = isPlayerSpectator(player);

    return (
        <Tippy
            trigger={'click'}
            duration={[100, 0]}
            placement="bottom-start"
            role="menu"
            theme="menu"
            interactive={true}
            arrow={false}
            content={
                <>
                    {translateCommon('menu', t)}
                    <ActionButtonRow
                        direction={BUTTON_ROW_DIRECTION.COLUMN}
                        buttons={[
                            togglePlayerMode &&
                                (isSpectator
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
                                      }),
                            changeCards && {
                                icon: 'refresh',
                                text: translateCommon('changeCards', t),
                                callback: changeCards,
                                type: BUTTON_TYPES.PRIMARY,
                                disabled: true, // isPlayerCardCzar(player) || isPlayerSpectatorOrJoining(player) || isLobby,
                                tooltip: translateUnderWork('underWork', t),
                            },
                            returnBackToLobby && {
                                icon: 'home',
                                text: translateCommon('returnToLobby', t),
                                callback: returnBackToLobby,
                                type: BUTTON_TYPES.PRIMARY,
                                disabled: !isPlayerHost(player) || isLobby,
                            },
                            openGameSettings && {
                                icon: 'settings',
                                text: translateCommon('gameSettings', t),
                                callback: openGameSettings,
                                type: BUTTON_TYPES.PRIMARY,
                                disabled: isLobby,
                            },
                            openHistory && {
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
        >
            <Button icon={'menu'}></Button>
        </Tippy>
    );
};

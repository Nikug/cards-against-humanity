import { ActionButtonRow, BUTTON_ROW_DIRECTION } from './ActionButtonRow';
import { Button, BUTTON_TYPES } from '../../../../components/general/Button.tsx';
import { GAME_STATES } from '../../../../consts/gamestates';
import React from 'react';
import { translateCommon, translateUnderWork } from '../../../../helpers/translation-helpers';
import { useTranslation } from 'react-i18next';
import Tippy from '@tippyjs/react';
import { useSelector } from 'react-redux';
import { gameRoundsSelector, gameStateSelector } from '../../../../selectors/gameSelectors';
import { playerIsHostSelector, playerIsSpectatorSelector } from '../../../../selectors/playerSelectors';

export const GameMenu = ({ callbacks: { togglePlayerMode, changeCards, returnBackToLobby, openGameSettings, openHistory } }) => {
    const { t } = useTranslation();

    const gameState = useSelector(gameStateSelector);
    const rounds = useSelector(gameRoundsSelector);
    const isSpectator = useSelector(playerIsSpectatorSelector);
    const isHost = useSelector(playerIsHostSelector);

    const isLobby = gameState === GAME_STATES.LOBBY;

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
                                disabled: !isHost || isLobby,
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
                                disabled: !(rounds?.length > 0),
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

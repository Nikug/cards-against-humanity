import { isPlayerCardCzar, isPlayerHost, isPlayerSpectator, isPlayerSpectatorOrJoining } from '../../../../helpers/player-helpers';

import { ActionButtonRow } from './ActionButtonRow';
import { BUTTON_TYPES } from '../../../../components/general/Button.jsx';
import { GAME_STATES } from '../../../../consts/gamestates';
import React from 'react';
import { translateCommon, translateUnderWork } from '../../../../helpers/translation-helpers';
import { useGameContext } from '../../../../contexts/GameContext';
import { useTranslation } from 'react-i18next';
import { GameMenu } from './GameMenu';

export const GameMenuButtonRow = ({ callbacks: { togglePlayerMode, changeCards, returnBackToLobby, openGameSettings, openHistory } }) => {
    const { t } = useTranslation();
    const { game, player } = useGameContext();

    const isLobby = game?.state === GAME_STATES.LOBBY;
    const isSpectator = isPlayerSpectator(player);

    return (
        <div className="game-menu-button-row">
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
                    false &&
                        changeCards && {
                            icon: 'refresh',
                            text: translateCommon('changeCards', t),
                            callback: returnBackToLobby,
                            type: BUTTON_TYPES.PRIMARY,
                            disabled: true, // isPlayerCardCzar(player) || isPlayerSpectatorOrJoining(player) || isLobby,
                            tooltip: translateUnderWork('underWork', t),
                        },
                ]}
            />
            <GameMenu
                callbacks={{
                    //togglePlayerMode,
                    changeCards,
                    returnBackToLobby,
                    openGameSettings,
                    openHistory,
                }}
            />
        </div>
    );
};

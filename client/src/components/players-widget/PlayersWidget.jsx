import { animated, useTransition } from 'react-spring';

import Icon from '../general/Icon';
import { PLAYER_STATES } from '../../consts/playerstates';
import { Player } from './player';
import React from 'react';
import { Spinner } from '../spinner';
import { isNullOrUndefined } from '../../helpers/generalhelpers';
import { translateCommon } from '../../helpers/translation-helpers';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { playerSelector } from '../../selectors/playerSelectors';
import { playersListSelector } from '../../selectors/playersListSelectors';

const renderPlayers = (players, self) => {
    const renderedPlayers = [];
    const ownId = self?.id;

    for (let i = 0, len = players.length; i < len; i++) {
        const player = players[i];
        const { id, isCardCzar, isHost, isPopularVoteKing, name, publicID, score, state } = player;

        renderedPlayers.push(
            <Player
                isCardCzar={isCardCzar}
                isHost={isHost}
                isPopularVoteKing={isPopularVoteKing}
                isSelf={!isNullOrUndefined(ownId) && id === ownId}
                key={publicID}
                name={state === PLAYER_STATES.PICKING_NAME ? null : name}
                player={player}
                publicID={publicID}
                score={score}
                state={state}
            />
        );
    }

    return renderedPlayers;
};

export const PlayersWidget = () => {
    const { t } = useTranslation();

    // State
    const player = useSelector(playerSelector);
    const players = useSelector(playersListSelector);

    let otherContent = null;

    // Player animation

    let playersToRender = players || [];

    playersToRender = playersToRender.filter((player) => {
        return player.state !== 'spectating';
    });

    // TODO: check if player/players is in loading state
    if (false) {
        otherContent = (
            <div className="players-widget loading">
                <Spinner />
            </div>
        );
    }

    if (playersToRender.length === 0) {
        otherContent = (
            <div className="players-widget no-active-players">
                <Icon name="sentiment_dissatisfied" />
                <div>{translateCommon('noActivePlayers', t)}</div>
            </div>
        );
    }

    const renderedPlayers = renderPlayers(playersToRender, player);

    const playerTransitions = useTransition(renderedPlayers, (player) => player.key, {
        initial: {
            opacity: 1,
        },
        from: {
            opacity: 0,
        },
        enter: {
            opacity: 1,
        },
        leave: {
            opacity: 0,
        },
        unique: true,
    });

    return otherContent ? (
        otherContent
    ) : (
        <div className="players-widget">
            {playerTransitions.map(({ item, props, key }) => (
                <animated.div key={key} style={props}>
                    {item}
                </animated.div>
            ))}
        </div>
    );
};

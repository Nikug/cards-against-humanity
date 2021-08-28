import { isPlayerCardCzar, isPlayerSpectatorOrJoining } from '../../helpers/player-helpers';

import { BlackCardPickerContainer } from '../../components/card-picker/blackcardpickercontainer';
import { CardReadingContainer } from '../../components/card-picker/cardreadingcontainer';
import { ErrorContainer } from './components/ErrorContainer';
import { GAME_STATES } from '../../consts/gamestates';
import { GameEndContainer } from '../../components/card-picker/gameendcontainer';
import { LobbyContent } from './phases/lobby/LobbyContent';
import { NamePicker } from './phases/lobby/NamePicker';
import React from 'react';
import { RoundEndContainer } from '../../components/card-picker/roundendcontainer';
import { WaitingCardPickerContainer } from '../../components/card-picker/waitincardpickercontainer';
import { WhiteCardPickerContainer } from '../../components/card-picker/whitecardpickercontainer';
import { WinnerCardPickerContainer } from '../../components/card-picker/winnercardpickercontainer';
import { canStartGame } from './helpers/canStartGame';
import { getRandomSpinner } from '../../components/spinner';
import { translateCommon } from '../../helpers/translation-helpers';
import { useGameContext } from '../../contexts/GameContext';

export const getGamePhaseContent = ({
    t,
    game,
    player,
    players,
    callbacks: { setPlayerName, givePopularVote, startGame },
    blackCards,
    popularVotedCardsIDs,
}) => {
    const gameState = game?.state;
    const playerState = player?.state;
    const disableStartGameButton = !canStartGame(game, players);
    const isCardCzar = isPlayerCardCzar(player);
    const isSpectator = isPlayerSpectatorOrJoining(player);

    if (!game?.id || !player?.id) {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '30%',
                }}
            >
                {getRandomSpinner()}
            </div>
        );
    }

    if (gameState !== 'lobby' && playerState === 'pickingName') {
        return <NamePicker setPlayerName={setPlayerName} />;
    }

    switch (gameState) {
        case GAME_STATES.LOBBY:
            return <LobbyContent setPlayerName={setPlayerName} startGame={startGame} disableStartGameButton={disableStartGameButton} />;
        case GAME_STATES.PICKING_BLACK_CARD:
            if (isCardCzar) {
                return <BlackCardPickerContainer blackCards={blackCards} />;
            }

            const cardCzarName = game.players.filter((player) => player.isCardCzar)[0].name;

            return (
                <WaitingCardPickerContainer
                    alternativeText={translateCommon('_player_isChoosingBlackCard', t, { player: cardCzarName })}
                    showMainCard={false}
                />
            );
        case GAME_STATES.PLAYING_WHITE_CARDS:
            if (isCardCzar || isSpectator) {
                return (
                    <WaitingCardPickerContainer
                        alternativeText={`${translateCommon('playersAreChoosingWhiteCards', t)}...`}
                        showMainCard={true}
                        noBigMainCard={true}
                    />
                );
            }
            return <WhiteCardPickerContainer />;
        case GAME_STATES.READING_CARDS:
            return <CardReadingContainer />;
        case GAME_STATES.SHOWING_CARDS:
            return <WinnerCardPickerContainer givePopularVote={givePopularVote} popularVotedCardsIDs={popularVotedCardsIDs} />;
        case GAME_STATES.ROUND_END:
            return <RoundEndContainer givePopularVote={givePopularVote} popularVotedCardsIDs={popularVotedCardsIDs} />;
        case GAME_STATES.GAME_OVER:
            return <GameEndContainer />;
        default:
            return <ErrorContainer />;
    }
};

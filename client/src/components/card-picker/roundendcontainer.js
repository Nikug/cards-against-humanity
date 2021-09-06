import React, { useState } from 'react';
import { socket } from '../sockets/socket';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { CardPicker } from './cardpicker';
import Confetti from 'react-confetti';
import { emptyFn } from '../../helpers/generalhelpers';
import { mergeWhiteCardsByplayer } from './cardformathelpers/mergeWhiteCardsByplayer';
import { translateCommon } from '../../helpers/translation-helpers';
import { useWindowSize } from '../../helpers/hooks';
import { WinnerText } from './components/WinnerText';
import { playerIdSelector, playerIsCardCzarSelector } from '../../selectors/playerSelectors';
import { gameBlackCardSelector, gameIdSelector, gameTimersSelector, gameWhiteCardsByPlayerSelector } from '../../selectors/gameSelectors';
import { playersListCardCzarNameSelector } from '../../selectors/playersListSelectors';
import { gameSettingsPopularVoteSelector } from '../../selectors/gameSettingsSelectors';

const DEFAULT_TIMEOUT = 5000;

export function RoundEndContainer({ popularVotedCardsIDs, givePopularVote }) {
    // Hooks
    const { t } = useTranslation();
    const { width, height } = useWindowSize();

    // State
    const gameID = useSelector(gameIdSelector);
    const playerID = useSelector(playerIdSelector);
    const isCardCzar = useSelector(playerIsCardCzarSelector);
    const timers = useSelector(gameTimersSelector);
    const whiteCardsByPlayer = useSelector(gameWhiteCardsByPlayerSelector);
    const blackCard = useSelector(gameBlackCardSelector);
    const cardCzarName = useSelector(playersListCardCzarNameSelector);
    const showPopularVote = useSelector(gameSettingsPopularVoteSelector);

    const [startingNewRound, setStartingNewRound] = useState(false);

    const { passedTime, duration } = timers || {};
    let timeout = DEFAULT_TIMEOUT;

    if (passedTime && duration) {
        timeout = (duration - passedTime) * 1000;
    }

    const winningWhiteCardsByPlayer = whiteCardsByPlayer.find((card) => card.playerName != null);
    const [whiteCards, confirmedCards] = mergeWhiteCardsByplayer(whiteCardsByPlayer);

    const startNewRound = () => {
        setStartingNewRound(true);

        socket.emit('start_round', {
            gameID,
            playerID,
        });
    };

    return (
        <>
            {winningWhiteCardsByPlayer?.playerName !== undefined && (
                // https://www.npmjs.com/package/react-confetti
                // Slicing 20 px from each dimension to avoid annoying overflow. Should have a better look how to fix.
                <div className="confetti">
                    <Confetti tweenDuration={timeout} opacity={0.4} numberOfPieces={400} recycle={false} width={width - 5} height={height - 5} />
                </div>
            )}
            <div className="cardpicker-container">
                <CardPicker
                    mainCard={blackCard}
                    selectableCards={whiteCards}
                    selectedCards={confirmedCards}
                    confirmedCards={confirmedCards}
                    selectCard={emptyFn}
                    confirmCards={startNewRound}
                    description={showPopularVote ? translateCommon('voteYourFavouriteCards', t) : translateCommon('whiteCards', t)}
                    alternativeText={isCardCzar ? `${translateCommon('waitingFor_player_ToStartNextRound', t, { player: cardCzarName })}...` : undefined}
                    customButtonTexts={[translateCommon('nextRound', t), `${translateCommon('loading', t)}...`]}
                    customButtonIcons={['arrow_forward', 'cached']}
                    customButtonState={startingNewRound ? 1 : 0}
                    topText={<WinnerText name={winningWhiteCardsByPlayer?.playerName} cardCzarName={cardCzarName} />}
                    showPopularVote={showPopularVote}
                    givePopularVote={givePopularVote}
                    popularVotedCardsIDs={popularVotedCardsIDs}
                    showStreaks={true}
                    noBigMainCard={false}
                    noActionButton={!isCardCzar}
                />
            </div>
        </>
    );
}

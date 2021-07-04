import { OneRoundHistory } from './OneRoundHistory';
import React from 'react';
import { renderBlackCardwithWhiteCards } from '../../../../../components/card-picker/cardformathelpers/renderBlackcardWithWhiteCards';
import { translateCommon } from '../../../../../helpers/translation-helpers';
import { useGameContext } from '../../../../../contexts/GameContext';
import { useTranslation } from 'react-i18next';

export const HistoryContainer = () => {
    const { t } = useTranslation();
    const { game } = useGameContext();
    const rounds = game?.rounds;
    const roundContainers = [];

    if (rounds?.length > 0) {
        for (let i = 0, len = rounds.length; i < len; i++) {
            const round = rounds[i];
            const blackCard = round.blackCard;
            const whiteCardsByPlayer = round?.whiteCardsByPlayer;
            const cards = [];

            for (let j = 0, len = rounds.length; j < len; j++) {
                const whiteCards = whiteCardsByPlayer[j];

                if (whiteCards?.whiteCards) {
                    cards.push(
                        renderBlackCardwithWhiteCards({
                            blackCard,
                            whiteCards: whiteCards.whiteCards,
                            popularVoteScore: whiteCards.popularVote,
                            isBigCard: true,
                            key: j,
                        })
                    );
                }
            }

            if (cards.length > 0) {
                roundContainers.push(<OneRoundHistory cards={cards} roundNumber={i + 1} />);
            }
        }
    }

    return (
        <div className="history-container">
            <div className="title">{translateCommon('previouslyPlayedCards', t)}:</div>
            <div className="container">{roundContainers}</div>
        </div>
    );
};

import React, { useState } from 'react';
import { containsObjectWithMatchingFieldIndex, emptyFn } from '../../helpers/generalhelpers';

import { CardPicker } from './cardpicker';
import { mergeWhiteCardsByplayer } from './cardformathelpers/mergeWhiteCardsByplayer';
import { socket } from '../sockets/socket';
import { translateCommon } from '../../helpers/translation-helpers';
import { useTranslation } from 'react-i18next';
import { useGameContext } from '../../contexts/GameContext';

export const WinnerCardPickerContainer = ({ givePopularVote, popularVotedCardsIDs }) => {
    const { t } = useTranslation();
    const { game, player } = useGameContext();
    const [selectedCards, setSelectedCards] = useState([]);
    const [confirmedCards, setConfirmedCards] = useState([]);

    const round = game.rounds.length - 1;
    const blackCard = game.rounds[round].blackCard;
    const isCardCzar = player?.isCardCzar;
    const hasPopularVote = game?.options?.popularVote;
    const whiteCardsByPlayer = game.rounds[round].whiteCardsByPlayer;
    const [whiteCards] = mergeWhiteCardsByplayer(whiteCardsByPlayer);

    const selectCard = (card) => {
        if (confirmedCards.length > 0) {
            return;
        }
        const newSelectedCards = selectedCards.slice();

        const pickLimit = 1;

        const i = containsObjectWithMatchingFieldIndex(card, newSelectedCards, 'id');
        if (i !== -1) {
            newSelectedCards.splice(i);
        } else if (newSelectedCards.length < pickLimit) {
            newSelectedCards.push(card);
        } else {
            newSelectedCards.pop();
            newSelectedCards.push(card);
        }
        setSelectedCards(newSelectedCards, card);
    };

    const confirmCard = () => {
        const pickLimit = 1;

        if (selectedCards.length === pickLimit) {
            const gameID = game.id;
            const playerID = player.id;

            socket.emit('pick_winning_card', {
                gameID: gameID,
                playerID: playerID,
                whiteCardIDs: selectedCards[0].id,
            });

            setConfirmedCards(selectedCards);
        }
    };

    return (
        <div className="cardpicker-container">
            <CardPicker
                mainCard={blackCard}
                selectableCards={whiteCards}
                selectedCards={selectedCards}
                confirmedCards={confirmedCards}
                selectCard={isCardCzar ? selectCard : emptyFn}
                confirmCards={isCardCzar ? confirmCard : emptyFn}
                description={
                    isCardCzar
                        ? translateCommon('chooseTheWinner', t)
                        : hasPopularVote
                        ? translateCommon('voteYourFavouriteCards', t)
                        : translateCommon('whiteCards', t)
                }
                alternativeText={isCardCzar ? undefined : `${translateCommon('cardCzarIsChoosingTheWinner', t)}...`}
                noActionButton={!isCardCzar}
                selectDisabled={selectedCards.length !== 1}
                showPopularVote={hasPopularVote && !isCardCzar}
                noBigMainCard={!isCardCzar}
                givePopularVote={givePopularVote}
                popularVotedCardsIDs={popularVotedCardsIDs}
                showPreviewTitle={true}
            />
        </div>
    );
};

import React, { useState, useEffect } from "react";
import { socket } from "../sockets/socket";

import { CardPicker } from "./cardpicker";
import { emptyFn } from "../../helpers/generalhelpers";

import Confetti from "react-confetti";

const TIMEOUT = 10000;

export function RoundEndContainer(props) {
    const { game, player, popularVotedCardsIDs, givePopularVote } = props;

    let timeout = TIMEOUT;

    if (game?.timers.passedTime && game?.timers.duration) {
        const { passedTime, duration } = game.timers;
        timeout = (duration - passedTime) * 1000;
    }

    const [startingNewRound, setStartingNewRound] = useState(false);

    const startNewRound = () => {
        setStartingNewRound(true);
        socket.emit("start_round", {
            gameID: game.id,
            playerID: player.id,
        });
    };

    const whiteCardsByPlayer =
        game.rounds[game.rounds.length - 1].whiteCardsByPlayer;
    const whiteCardsToRender = [];
    const confirmedCards = [];
    const winningWhiteCardsByPlayer = whiteCardsByPlayer.find(
        (card) => card.playerName != null
    );

    for (let i = 0, len = whiteCardsByPlayer.length; i < len; i++) {
        const whiteCards = whiteCardsByPlayer[i].whiteCards;
        const newWhiteCard = {
            id: [],
            cardPackID: [],
            text: [],
        };

        for (let j = 0, len2 = whiteCards.length; j < len2; j++) {
            const whiteCard = whiteCards[j];

            newWhiteCard.id.push(whiteCard.id);
            newWhiteCard.cardPackID.push(whiteCard.cardPackID);
            newWhiteCard.text.push(whiteCard.text);
        }

        whiteCardsToRender.push(newWhiteCard);

        if (whiteCardsByPlayer[i].wonRound) {
            confirmedCards.push(newWhiteCard);
        }
    }

    const whiteCards = whiteCardsToRender;

    const blackCard = game.rounds[game.rounds.length - 1].blackCard;
    const showPopularVote = game?.options?.popularVote;
    const cardCzarName = game.players.filter(
        (player) => player.isCardCzar === true
    )[0].name;

    return (
        <>
            {winningWhiteCardsByPlayer?.playerName !== undefined && (
                // https://www.npmjs.com/package/react-confetti
                <Confetti
                    tweenDuration={timeout}
                    opacity={0.4}
                    numberOfPieces={400}
                    recycle={false}
                    width={window.width}
                    height={window.height}
                />
            )}
            <div className="blackcardpicker">
                <CardPicker
                    mainCard={blackCard}
                    selectableCards={whiteCards}
                    selectedCards={confirmedCards}
                    confirmedCards={confirmedCards}
                    selectCard={emptyFn}
                    confirmCards={startNewRound}
                    description={
                        showPopularVote
                            ? "Anna ääni suosikeillesi"
                            : "Valkoiset kortit"
                    }
                    alternativeText={
                        startingNewRound
                            ? `Odotetaan, että ${cardCzarName} aloittaa uuden kierroksen...`
                            : undefined
                    }
                    customButtonTexts={["Seuraava kierros", "Ladataan"]}
                    customButtonIcons={["arrow_forward", "cached"]}
                    customButtonState={startingNewRound ? 1 : 0}
                    topText={
                        winningWhiteCardsByPlayer?.playerName
                            ? `🎉 ${winningWhiteCardsByPlayer?.playerName} voitti kierroksen! 🎉`
                            : `${cardCzarName} ei valinnut voittajaa ja menetti pisteen...`
                    }
                    showPopularVote={showPopularVote}
                    givePopularVote={givePopularVote}
                    popularVotedCardsIDs={popularVotedCardsIDs}
                    noBigMainCard={false}
                    noActionButton={!player.isCardCzar}
                />
            </div>
        </>
    );
}

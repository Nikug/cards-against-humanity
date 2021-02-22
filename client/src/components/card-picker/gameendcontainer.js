import React, { useState, useEffect } from "react";
import { socket } from "../sockets/socket";
import { CardPicker } from "./cardpicker";
import { emptyFn } from "../../helpers/generalhelpers";
import { renderBlackCardwithWhiteCards } from "./cardformathelpers.js/renderBlackcardWithWhiteCards";
import Confetti from "react-confetti";

export const GameEndContainer = ({ game, player }) => {
    const [returningBackToLobby, setReturningBackToLobby] = useState(false);

    const playersSorted = game.players.sort(function (a, b) {
        var keyA = new Date(a.score),
            keyB = new Date(b.score);
        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
        return 0;
    });

    const winnerCards = [];
    const rounds = game?.rounds;

    if (rounds?.length > 0) {
        for (let i = 0, len = rounds.length; i < len; i++) {
            const round = rounds[i];
            const blackCard = round.blackCard;
            const whiteCards = round.whiteCardsByPlayer.find((card) => {
                return card.wonRound === true;
            });
            if (whiteCards?.whiteCards) {
                winnerCards.push(
                    renderBlackCardwithWhiteCards({
                        blackCard,
                        whiteCards: whiteCards.whiteCards,
                        popularVoteScore: whiteCards.popularVote,
                        playerName: whiteCards.playerName,
                        isBigCard: true,
                        key: i,
                    })
                );
            }
        }
    }

    const sortedWinnerCards = winnerCards.sort(function (a, b) {
        var keyA = a.props.popularVoteScore,
            keyB = b.props.popularVoteScore;
        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
        return 0;
    });

    const returnBackToLobby = () => {
        setReturningBackToLobby(true);
        socket.emit("return_to_lobby", {
            gameID: game?.id,
            playerID: player?.id,
        });
    };

    return (
        <>
            <Confetti
                tweenDuration={3000}
                opacity={0.4}
                numberOfPieces={3000}
                recycle={false}
                width={window.width}
                height={window.height}
            />
            <div className="blackcardpicker">
                <CardPicker
                    selectCard={emptyFn}
                    confirmCards={returnBackToLobby}
                    customButtonState={returningBackToLobby ? 1 : 0}
                    customButtonTexts={["Palaa aulaan", "Palataan aulaan..."]}
                    centerActionButton={true}
                    noActionButton={!player?.isHost}
                    topText={`🎉🎉🎉 ${
                        playersSorted[0].name ?? "Joku"
                    } voitti pelin! 🎉🎉🎉`}
                    description={"Tämän pelin voittajakortit:"}
                    preRenderedCards={sortedWinnerCards}
                />
            </div>
        </>
    );
};

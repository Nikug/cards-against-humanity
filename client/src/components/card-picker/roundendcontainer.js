import React, { useState } from "react";

import { CardPicker } from "./cardpicker";
import Confetti from "react-confetti";
import { emptyFn } from "../../helpers/generalhelpers";
import { isPlayerCardCzar } from "../../helpers/player-helpers";
import { mergeWhiteCardsByplayer } from "./cardformathelpers.js/mergeWhiteCardsByplayer";
import { socket } from "../sockets/socket";
import { translateCommon } from "../../helpers/translation-helpers";
import { useTranslation } from "react-i18next";

const TIMEOUT = 10000;

export function RoundEndContainer(props) {
    const { t } = useTranslation();
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
    const winningWhiteCardsByPlayer = whiteCardsByPlayer.find(
        (card) => card.playerName != null
    );

    const [whiteCards, confirmedCards] = mergeWhiteCardsByplayer(
        whiteCardsByPlayer
    );

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
                    width={window.innerWidth}
                    height={window.innerHeight}
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
                            ? translateCommon("voteYourFavouriteCards", t)
                            : translateCommon("whiteCards", t)
                    }
                    alternativeText={
                        isPlayerCardCzar(player)
                            ? `${translateCommon(
                                  "waitingFor_player_ToStartNextRound",
                                  t,
                                  { player: cardCzarName }
                              )}...`
                            : undefined
                    }
                    customButtonTexts={[
                        translateCommon("nextRound", t),
                        `${translateCommon("loading", t)}...`,
                    ]}
                    customButtonIcons={["arrow_forward", "cached"]}
                    customButtonState={startingNewRound ? 1 : 0}
                    topText={
                        winningWhiteCardsByPlayer?.playerName
                            ? `🎉 ${
                                  ("_player_WonTheRound",
                                  t,
                                  {
                                      player:
                                          winningWhiteCardsByPlayer?.playerName,
                                  })
                              }! 🎉`
                            : `${translateCommon(
                                  "_player_DidNotChooseAWinnerAndLostOnePoint",
                                  t,
                                  { player: cardCzarName }
                              )}...`
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

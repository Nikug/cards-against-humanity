import React, { useState, useEffect } from "react";
import { socket } from "../sockets/socket";

import { CardPicker } from "./cardpicker";
import { emptyFn } from "../../helpers/generalhelpers";

const TIMEOUT = 5000;

export function RoundEndContainer(props) {
    const { game, player } = props;

    const [startingNewRound, setStartingNewRound] = useState(false);

    const startNewRound = () => {
        socket.emit("start_round", {
            gameID: game.id,
            playerID: player.id,
        });
    };

    useEffect(() => {
        setStartingNewRound(true);
        if (player?.isCardCzar) {
            setTimeout(startNewRound, TIMEOUT);
        }
    }, [props, player, game]);

    const whiteCardsByPlayer =
        game.rounds[game.rounds.length - 1].whiteCardsByPlayer;
    const whiteCardsToRender = [];
    const confirmedCards = [];
    console.log("WhiteCards by player", whiteCardsByPlayer);

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

        console.log({ wonRound: whiteCardsByPlayer[i].wonRound });
        if (whiteCardsByPlayer[i].wonRound) {
            confirmedCards.push(newWhiteCard);
        }
    }

    const whiteCards = whiteCardsToRender;

    const blackCard = game.rounds[game.rounds.length - 1].blackCard;
    const isCardCzar = player?.isCardCzar;
    const hasPopularVote = game?.options?.popularVote;

    return (
        <div className="blackcardpicker">
            <CardPicker
                mainCard={blackCard}
                selectableCards={whiteCards}
                selectedCards={confirmedCards}
                confirmedCards={confirmedCards}
                selectCard={emptyFn}
                confirmCards={emptyFn}
                description={
                    hasPopularVote
                        ? "Anna ääni suosikeillesi"
                        : "Valkoiset kortit"
                }
                alternativeText={
                    startingNewRound
                        ? "Käynnistetään uutta kierrosta..."
                        : undefined
                }
                /*
                customButtonTexts={["Seuraava kierros", "Ladataan"]}
                customButtonIcons={["arrow_forward", "cached"]}
                */
                noActionButton={true}
                topText={"Voittaja kortti on tässä!"}
                showPopularVote={true}
            />
        </div>
    );
}

import React from "react";

import { GAME_STATES } from "../../consts/gamestates";
import { canStartGame } from "./helpers/canStartGame";

import { BlackCardPickerContainer } from "../../components/card-picker/blackcardpickercontainer";
import { WaitingCardPickerContainer } from "../../components/card-picker/waitincardpickercontainer";
import { CardReadingContainer } from "../../components/card-picker/cardreadingcontainer";
import { WinnerCardPickerContainer } from "../../components/card-picker/winnercardpickercontainer";
import { RoundEndContainer } from "../../components/card-picker/roundendcontainer";
import { GameEndContainer } from "../../components/card-picker/gameendcontainer";
import { LobbyContent } from "./phases/lobby/LobbyContent";
import { NamePicker } from "./phases/lobby/NamePicker";
import { ErrorContainer } from "./components/ErrorContainer";
import { WhiteCardPickerContainer } from "../../components/card-picker/whitecardpickercontainer";

export const getGamePhaseContent = ({
    callbacks: { setPlayerName, givePopularVote, togglePlayerMode, startGame },
    game,
    player,
    blackCards,
    popularVotedCardsIDs,
}) => {
    const gameState = game?.state;
    const disableStartGameButton = !canStartGame(game);
    const isCardCzar = player?.isCardCzar;

    if (gameState !== "lobby" && player?.state === "pickingName") {
        return <NamePicker setPlayerName={setPlayerName} />;
    }

    switch (gameState) {
        case GAME_STATES.LOBBY:
            return (
                <LobbyContent
                    game={game}
                    player={player}
                    setPlayerName={setPlayerName}
                    startGame={startGame}
                    disableStartGameButton={disableStartGameButton}
                />
            );
        case GAME_STATES.PICKING_BLACK_CARD:
            if (isCardCzar) {
                return (
                    <BlackCardPickerContainer
                        player={player}
                        game={game}
                        blackCards={blackCards}
                    />
                );
            }
            const cardCzarName = game.players.filter(
                (player) => player.isCardCzar
            )[0].name;

            return (
                <WaitingCardPickerContainer
                    player={player}
                    game={game}
                    alternativeText={`${cardCzarName} valitsee mustaa korttia...`}
                    showMainCard={false}
                />
            );
        case GAME_STATES.PLAYING_WHITE_CARDS:
            if (isCardCzar) {
                return (
                    <WaitingCardPickerContainer
                        player={player}
                        game={game}
                        alternativeText={
                            "Muut valitsevat valkoisia korttejaan..."
                        }
                        showMainCard={true}
                        noBigMainCard={true}
                    />
                );
            }
            return <WhiteCardPickerContainer player={player} game={game} />;
        case GAME_STATES.READING_CARDS:
            return <CardReadingContainer player={player} game={game} />;
        case GAME_STATES.SHOWING_CARDS:
            return (
                <WinnerCardPickerContainer
                    player={player}
                    game={game}
                    givePopularVote={givePopularVote}
                    popularVotedCardsIDs={popularVotedCardsIDs}
                />
            );
        case GAME_STATES.ROUND_END:
            return (
                <RoundEndContainer
                    player={player}
                    game={game}
                    givePopularVote={givePopularVote}
                    popularVotedCardsIDs={popularVotedCardsIDs}
                />
            );
        case GAME_STATES.GAME_OVER:
            return <GameEndContainer player={player} game={game} />;
        default:
            return <ErrorContainer />;
    }
};

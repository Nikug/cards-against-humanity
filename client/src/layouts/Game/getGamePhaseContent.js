import {
    isPlayerCardCzar,
    isPlayerSpectatorOrJoining,
} from "../../helpers/player-helpers";

import { BlackCardPickerContainer } from "../../components/card-picker/blackcardpickercontainer";
import { CardReadingContainer } from "../../components/card-picker/cardreadingcontainer";
import { ErrorContainer } from "./components/ErrorContainer";
import { GAME_STATES } from "../../consts/gamestates";
import { GameEndContainer } from "../../components/card-picker/gameendcontainer";
import { LobbyContent } from "./phases/lobby/LobbyContent";
import { NamePicker } from "./phases/lobby/NamePicker";
import React from "react";
import { RoundEndContainer } from "../../components/card-picker/roundendcontainer";
import { WaitingCardPickerContainer } from "../../components/card-picker/waitincardpickercontainer";
import { WhiteCardPickerContainer } from "../../components/card-picker/whitecardpickercontainer";
import { WinnerCardPickerContainer } from "../../components/card-picker/winnercardpickercontainer";
import { canStartGame } from "./helpers/canStartGame";
import { getRandomSpinner } from "../../components/spinner";
import { useTranslation } from "react-i18next";

export const getGamePhaseContent = ({
    callbacks: { setPlayerName, givePopularVote, togglePlayerMode, startGame },
    game,
    player,
    blackCards,
    popularVotedCardsIDs,
}) => {
    const { t } = useTranslation;
    const gameState = game?.state;
    const playerState = player?.state;
    const disableStartGameButton = !canStartGame(game);
    const isCardCzar = isPlayerCardCzar(player);
    const isSpectator = isPlayerSpectatorOrJoining(player);

    if (!game || !player) {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {getRandomSpinner()}
            </div>
        );
    }

    if (gameState !== "lobby" && playerState === "pickingName") {
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
            if (isCardCzar || isSpectator) {
                return (
                    <WaitingCardPickerContainer
                        player={player}
                        game={game}
                        alternativeText={
                            "Pelaajat valitsevat valkoisia korttejaan..."
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

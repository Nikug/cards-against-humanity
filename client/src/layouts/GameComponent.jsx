import React from "react";

import { GameSettingsContainer } from "../components/game-settings/gamesettingscontainer";
import Button, { BUTTON_TYPES } from "../components/button";
import { Setting, CONTROL_TYPES } from "./../components/settings/setting";

import "./../styles/game.scss";
import { GAME_STATES } from "../consts/gamestates";
import { BlackCardPickerContainer } from "../components/card-picker/blackcardpickercontainer";
import { WhiteCardPickerContainer } from "../components/card-picker/whitecardpickercontainer";
import { WinnerCardPickerContainer } from "../components/card-picker/winnercardpickercontainer";
import { WaitingCardPickerContainer } from "../components/card-picker/waitincardpickercontainer";
import { CardReadingContainer } from "../components/card-picker/cardreadingcontainer";
import { RoundEndContainer } from "../components/card-picker/roundendcontainer";
import { PlayerName } from "../components/options/PlayerName";

export const getRenderedComponent = (player, game) => {
    const gameState = game?.state;
    if (!player)
        return (
            <div className="error-info">
                Something went wrong. Try to reload the page.
            </div>
        );

    if (gameState !== "lobby" && player?.state === "pickingName") {
        return <PlayerName gameID={game?.id} playerID={player?.id} />;
    }

    let renderedContent;
    if (player?.isCardCzar) {
        switch (gameState) {
            case GAME_STATES.LOBBY:
                renderedContent = (
                    <>
                        <div className="info">
                            <div className="game-settings-container">
                                <div className="nick-and-start-container">
                                    <div className="nickname-selector">
                                        <Setting
                                            text={"Nimimerkki"}
                                            placeholderText={"nimimerkki"}
                                            controlType={
                                                CONTROL_TYPES.textWithConfirm
                                            }
                                            onChangeCallback={setPlayerName}
                                            icon={{
                                                name: "person",
                                                className: iconClassnames,
                                            }}
                                            charLimit={35}
                                        />
                                    </div>
                                    {player?.isHost && (
                                        <Button
                                            icon={"play_circle_filled"}
                                            iconPosition={"after"}
                                            text={"Aloita peli"}
                                            type={BUTTON_TYPES.GREEN}
                                            additionalClassname={"big-btn"}
                                            callback={() =>
                                                startGame(game?.id, player?.id)
                                            }
                                            disabled={
                                                !canStartGame ||
                                                player?.isHost !== true
                                            }
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="info">
                            <GameSettingsContainer
                                options={game ? game.options : {}}
                                gameID={game?.id}
                                isHost={player?.isHost}
                                isDisabled={player?.isHost !== true}
                                playerID={player?.id}
                            />
                        </div>
                    </>
                );
                break;
            case GAME_STATES.PICKING_BLACK_CARD:
                renderedContent = (
                    <BlackCardPickerContainer
                        player={player}
                        game={game}
                        blackCards={blackCards}
                    />
                );
                break;
            case GAME_STATES.PLAYING_WHITE_CARDS:
                renderedContent = (
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
                break;
            case GAME_STATES.READING_CARDS:
                renderedContent = (
                    <CardReadingContainer player={player} game={game} />
                );
                break;
            case GAME_STATES.SHOWING_CARDS:
                renderedContent = (
                    <WinnerCardPickerContainer
                        player={player}
                        game={game}
                        givePopularVote={givePopularVote}
                        popularVotedCardsIDs={popularVotedCardsIDs}
                    />
                );
                break;
            case GAME_STATES.ROUND_END:
                renderedContent = (
                    <RoundEndContainer
                        player={player}
                        game={game}
                        givePopularVote={givePopularVote}
                        popularVotedCardsIDs={popularVotedCardsIDs}
                    />
                );
                break;
            default:
                renderedContent = (
                    <div className="error-info">
                        Something went wrong. Try to reload the page.
                    </div>
                );
                break;
        }
    } else {
        switch (gameState) {
            case GAME_STATES.LOBBY:
                renderedContent = (
                    <>
                        <div className="info">
                            <div className="game-settings-container">
                                <div className="nick-and-start-container">
                                    <div className="nickname-selector">
                                        <Setting
                                            text={"Nimimerkki"}
                                            placeholderText={"nimnimerkki"}
                                            controlType={
                                                CONTROL_TYPES.textWithConfirm
                                            }
                                            onChangeCallback={setPlayerName}
                                            icon={{
                                                name: "person",
                                                className: iconClassnames,
                                            }}
                                            charLimit={35}
                                        />
                                    </div>
                                    {player?.isHost && (
                                        <Button
                                            icon={"play_circle_filled"}
                                            iconPosition={"after"}
                                            text={"Aloita peli"}
                                            type={BUTTON_TYPES.GREEN}
                                            additionalClassname={"big-btn"}
                                            callback={() =>
                                                startGame(game?.id, player?.id)
                                            }
                                            disabled={
                                                !canStartGame ||
                                                player?.isHost !== true
                                            }
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="info">
                            <GameSettingsContainer
                                options={game ? game.options : {}}
                                gameID={game?.id}
                                isHost={player?.isHost}
                                isDisabled={player?.isHost !== true}
                                playerID={player?.id}
                            />
                        </div>
                    </>
                );
                break;
            case GAME_STATES.PICKING_BLACK_CARD:
                renderedContent = (
                    <div>
                        <WaitingCardPickerContainer
                            player={player}
                            game={game}
                            alternativeText={
                                "Korttikuningas valitsee korttia..."
                            }
                            showMainCard={false}
                        />
                    </div>
                );
                break;
            case GAME_STATES.PLAYING_WHITE_CARDS:
                renderedContent = (
                    <WhiteCardPickerContainer player={player} game={game} />
                );
                break;
            case GAME_STATES.READING_CARDS:
                renderedContent = (
                    <CardReadingContainer player={player} game={game} />
                );
                break;
            case GAME_STATES.SHOWING_CARDS:
                renderedContent = (
                    <div>
                        <WinnerCardPickerContainer
                            player={player}
                            game={game}
                            givePopularVote={givePopularVote}
                            popularVotedCardsIDs={popularVotedCardsIDs}
                        />
                    </div>
                );
                break;
            case GAME_STATES.ROUND_END:
                renderedContent = (
                    <RoundEndContainer
                        player={player}
                        game={game}
                        givePopularVote={givePopularVote}
                        popularVotedCardsIDs={popularVotedCardsIDs}
                    />
                );
                break;
            default:
                renderedContent = (
                    <div className="error-info">
                        Something went wrong. Try to reload the page.
                    </div>
                );
                break;
        }
    }
};

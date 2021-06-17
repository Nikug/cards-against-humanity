import { CONTROL_TYPES, Setting } from './../settings/setting';

import { CardPack } from './CardPack';
import { CollabsibelSettingsSection } from '../settings/collabsiblesettingssection';
import React from 'react';
import { socket } from '../sockets/socket';
import { translateCommon } from '../../helpers/translation-helpers';
import { useTranslation } from 'react-i18next';
import { GameSettingsHeader } from './GamseSettingsHeader';
import { CANNOT_CHANGE, changeValue } from './gamesettingshelpers';

export const GameSettings = ({ options, gameID, isDisabled, playerID }) => {
    const { t } = useTranslation();
    const updateOptions = (key, value) => {
        if (!playerID || !gameID) return;
        if (value === undefined) return;

        const newOptions = { ...options, [key]: value };

        socket.emit('update_game_options', {
            options: newOptions,
            gameID: gameID,
            playerID: playerID,
        });
    };

    const updateTimers = ({ field, value }) => {
        if (!playerID || !gameID) return;

        const oldValue = options.timers[field];
        let newValue;

        switch (value) {
            case 'increase':
                newValue = oldValue + 5;
                break;
            case 'decrease':
                newValue = oldValue - 5;
                break;
            default:
                newValue = value;
                break;
        }

        if (Number.isInteger(newValue) && (newValue < 5 || newValue > 600)) {
            return;
        }

        const newTimers = { ...options.timers, [field]: newValue };

        updateOptions('timers', newTimers);
    };

    const changeMaxPlayers = (value) => {
        const oldValue = options.maximumPlayers;

        const newValue = changeValue(value, oldValue, 1, 99, null);

        if (newValue === CANNOT_CHANGE) {
            return;
        }

        updateOptions('maximumPlayers', newValue);
    };

    const changeWinCondition = ({ field, value }) => {
        const oldValue = options.winConditions[field];

        const newValue = changeValue(value, oldValue, 1);

        if (newValue === CANNOT_CHANGE) {
            return;
        }

        if (Number.isInteger(newValue) && newValue < 1) {
            return;
        }

        const newValues = { ...options.winConditions, [field]: newValue };

        updateOptions('winConditions', newValues);
    };

    const toggleValue = (value) => {
        const oldValue = options[value];
        const newValue = !oldValue;

        updateOptions(value, newValue);
    };

    const addCardPack = (id) => {
        socket.emit('add_card_pack', {
            gameID: gameID,
            cardPackID: id,
            playerID: playerID,
        });
    };

    const removeCardpack = (id) => {
        socket.emit('remove_card_pack', {
            gameID: gameID,
            cardPackID: id,
            playerID: playerID,
        });
    };

    const renderCardPacks = (cardPacks) => {
        const renderedCardPacks = [];

        if (!cardPacks) {
            return;
        }

        cardPacks.forEach((cardPack) => {
            const { name, id, isNSFW, whiteCards, blackCards } = cardPack;

            renderedCardPacks.push(
                <CardPack blackCards={blackCards} id={id} isNSFW={isNSFW} key={id} name={name} removeCardpack={removeCardpack} whiteCards={whiteCards} />
            );
        });

        return renderedCardPacks;
    };

    const iconClassnames = 'icon-margin-right';
    const { allowKickedPlayerJoin, cardPacks, maximumPlayers, popularVote, winConditions, winnerBecomesCardCzar } = options;
    const renderedCardPacks = renderCardPacks(cardPacks);
    const {
        readBlackCard,
        roundEnd,
        selectBlackCard,
        selectWhiteCards,
        selectWinner,
        useReadBlackCard,
        useRoundEnd,
        useSelectBlackCard,
        useSelectWhiteCards,
        useSelectWinner,
    } = options.timers;
    const { roundLimit, scoreLimit, useRoundLimit, useScoreLimit } = winConditions;

    return (
        <>
            <div className="settings-block">
                <GameSettingsHeader keyword={'gameSettings'} />
                <CollabsibelSettingsSection
                    isDisabled={isDisabled}
                    title={{
                        titleText: translateCommon('winCondition', t),
                        titleIconName: 'emoji_events',
                    }}
                    content={
                        <>
                            <Setting
                                text={translateCommon('scoreLimit', t)}
                                controlType={[CONTROL_TYPES.toggle, CONTROL_TYPES.number]}
                                onChangeCallback={changeWinCondition}
                                field={['useScoreLimit', 'scoreLimit']}
                                currentValue={[useScoreLimit, scoreLimit]}
                                isDisabled={isDisabled}
                            />
                            <Setting
                                text={translateCommon('roundLimit', t)}
                                controlType={[CONTROL_TYPES.toggle, CONTROL_TYPES.number]}
                                onChangeCallback={changeWinCondition}
                                field={['useRoundLimit', 'roundLimit']}
                                currentValue={[useRoundLimit, roundLimit]}
                                isDisabled={isDisabled}
                            />
                        </>
                    }
                />

                <Setting
                    text={translateCommon('playerLimit', t)}
                    controlType={[CONTROL_TYPES.number]}
                    onChangeCallback={changeMaxPlayers}
                    currentValue={[maximumPlayers]}
                    isDisabled={isDisabled}
                    icon={{
                        name: 'groups',
                        className: iconClassnames,
                        isDisabled: isDisabled,
                    }}
                />
                <CollabsibelSettingsSection
                    isDisabled={isDisabled}
                    title={{
                        titleText: translateCommon('timers', t),
                        titleIconName: 'hourglass_bottom',
                    }}
                    content={
                        <>
                            <Setting
                                text={translateCommon('choosingBlackCard', t)}
                                controlType={[CONTROL_TYPES.toggle, CONTROL_TYPES.number]}
                                onChangeCallback={updateTimers}
                                field={['useSelectBlackCard', 'selectBlackCard']}
                                currentValue={[useSelectBlackCard, selectBlackCard]}
                                isDisabled={isDisabled}
                            />
                            <Setting
                                text={translateCommon('choosingWhiteCard', t)}
                                controlType={[CONTROL_TYPES.toggle, CONTROL_TYPES.number]}
                                onChangeCallback={updateTimers}
                                field={['useSelectWhiteCards', 'selectWhiteCards']}
                                currentValue={[useSelectWhiteCards, selectWhiteCards]}
                                isDisabled={isDisabled}
                            />
                            <Setting
                                text={translateCommon('readingCard', t)}
                                controlType={[CONTROL_TYPES.toggle, CONTROL_TYPES.number]}
                                onChangeCallback={updateTimers}
                                field={['useReadBlackCard', 'readBlackCard']}
                                currentValue={[useReadBlackCard, readBlackCard]}
                                isDisabled={isDisabled}
                            />
                            <Setting
                                text={translateCommon('choosingWinner', t)}
                                controlType={[CONTROL_TYPES.toggle, CONTROL_TYPES.number]}
                                onChangeCallback={updateTimers}
                                field={['useSelectWinner', 'selectWinner']}
                                currentValue={[useSelectWinner, selectWinner]}
                                isDisabled={isDisabled}
                            />
                            <Setting
                                text={translateCommon('startingNextRound', t)}
                                controlType={[CONTROL_TYPES.toggle, CONTROL_TYPES.number]}
                                onChangeCallback={updateTimers}
                                field={['useRoundEnd', 'roundEnd']}
                                currentValue={[useRoundEnd, roundEnd]}
                                isDisabled={isDisabled}
                            />
                        </>
                    }
                />
                <Setting
                    text={translateCommon('popularVoteInUse', t)}
                    controlType={[CONTROL_TYPES.toggle]}
                    onChangeCallback={() => toggleValue('popularVote')}
                    currentValue={[popularVote ? popularVote : false]}
                    isDisabled={isDisabled}
                    icon={{
                        name: 'thumb_up',
                        className: iconClassnames,
                        isDisabled: isDisabled,
                    }}
                />
                <Setting
                    text={translateCommon('winnerBecomesNextCardCzar', t)}
                    controlType={[CONTROL_TYPES.toggle]}
                    onChangeCallback={() => toggleValue('winnerBecomesCardCzar')}
                    currentValue={[winnerBecomesCardCzar]}
                    isDisabled={isDisabled}
                    icon={{
                        name: 'low_priority',
                        className: iconClassnames,
                        isDisabled: isDisabled,
                    }}
                />
                <Setting
                    text={translateCommon('kickedPlayersCanJoinBack', t)}
                    controlType={[CONTROL_TYPES.toggle]}
                    onChangeCallback={() => toggleValue('allowKickedPlayerJoin')}
                    currentValue={[allowKickedPlayerJoin]}
                    isDisabled={isDisabled}
                    icon={{
                        name: 'remove_circle_outline',
                        className: iconClassnames,
                        isDisabled: isDisabled,
                    }}
                />
            </div>
            <div className="settings-block divider">
                <GameSettingsHeader keyword={'cardDecks'} />
                <Setting
                    DEV_CARD_PACK_AUTOFILL={false}
                    text={translateCommon('addCardDeck', t)}
                    placeholderText={'rAnD0MchArs'}
                    controlType={CONTROL_TYPES.textWithConfirm}
                    onChangeCallback={addCardPack}
                    isDisabled={isDisabled}
                    icon={{
                        name: 'library_add',
                        className: iconClassnames,
                        isDisabled: isDisabled,
                    }}
                />
                {/*<GameSettingsHeader keyword={"addedCardDecks"} />*/}
                <div className="imported-card-packs">{renderedCardPacks.length === 0 ? translateCommon('noCardDecks', t) : renderedCardPacks}</div>
            </div>
        </>
    );
};

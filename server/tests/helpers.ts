import * as gameUtils from "../modules/games/gameUtil";
import * as socketUtils from "../modules/utilities/socket";
import * as utils from "../modules/db/util";

import { BlackCard, Game, Player, WhiteCard } from "../types/types";

export const mockGameId = "test-id-1";
export const mockPlayerId = "player-1";
export const mockSocketId = "socket-1";

export const pgClientMock: any = {
    query: jest.fn((query, params) => ({ rows: [] })),
};

export const ioMock: any = {
    to: jest.fn(() => ({
        emit: jest.fn(),
    })),
};

export const socketMock: any = {
    emit: jest.fn(),
    join: jest.fn(),
    disconnect: jest.fn(),
};

export const mockTransactionize = () =>
    jest
        .spyOn(utils, "transactionize")
        .mockImplementation(async (callback, params) => {
            return await callback(...params, pgClientMock);
        });

export const mockSetGame = () =>
    jest
        .spyOn(gameUtils, "setGame")
        .mockImplementation(async (game: Game) => game);

export const mockGetGame = (returnValue: any) =>
    jest
        .spyOn(gameUtils, "getGame")
        .mockImplementation(async () => returnValue);

export const mockSendNotification = () =>
    jest
        .spyOn(socketUtils, "sendNotification")
        .mockImplementation((message: string) => message);

export const createPlayer = (
    id: string | number,
    isHost?: boolean,
    isCardCzar?: boolean
): Player => {
    return {
        id: id.toString(),
        name: id.toString(),
        publicID: id.toString(),
        state: "active",
        score: 0,
        sockets: [],
        popularVoteScore: 0,
        whiteCards: [],
        isCardCzar: isCardCzar ?? false,
        isHost: isHost ?? false,
        isPopularVoteKing: false,
        useTextToSpeech: false,
        avatar: {
            hatType: 0,
            eyeType: 0,
            mouthType: 0,
            skinType: 0,
        },
    };
};

export const createWhiteCards = (count: number): WhiteCard[] => {
    return Array(count)
        .fill(0)
        .map(
            (_, i): WhiteCard => ({
                id: i.toString(),
                cardPackID: "cardpack",
                text: "text",
            })
        );
};

export const createBlackCards = (count: number): BlackCard[] => {
    return Array(count)
        .fill(0)
        .map(
            (_, i): BlackCard => ({
                id: i.toString(),
                cardPackID: "cardpack",
                text: "text",
                whiteCardsToDraw: 1,
                whiteCardsToPlay: 1,
            })
        );
};

import * as utils from "../modules/db/util";

export const mockId = "test-id-1";

export const pgClientMock: any = {
    query: jest.fn((query, params) => ({ rows: [] })),
};

export const mockTransactionize = () =>
    jest.spyOn(utils, "transactionize").mockImplementation(() => pgClientMock);

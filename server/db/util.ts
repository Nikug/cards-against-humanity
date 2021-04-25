import {
    endTransaction,
    rollbackTransaction,
    startTransaction,
} from "./database";

export const transactionize = async (callback: any, params: any[]) => {
    if (!process.env.USE_DB) {
        return callback(...params);
    }

    const client = await startTransaction();
    try {
        return await callback(...params, client);
    } catch (e) {
        rollbackTransaction(client);
        console.error("Transaction rolled back!", e);
    } finally {
        endTransaction(client);
    }
};

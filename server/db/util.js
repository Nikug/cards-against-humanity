import {
    endTransaction,
    rollbackTransaction,
    startTransaction,
} from "./database.js";

export const transactionize = async (callback, params) => {
    if (!process.env.USE_DB) {
        callback(...params);
        return;
    }

    const client = await startTransaction();
    try {
        console.log("Starting transaction for", callback.name);
        return await callback(...params, client);
    } catch (e) {
        rollbackTransaction(client);
        console.error("Transaction rolled back!", e);
    } finally {
        console.log("Ending transaction for", callback.name);
        endTransaction(client);
    }
};

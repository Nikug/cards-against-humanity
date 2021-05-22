"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionize = void 0;
const database_1 = require("./database");
const transactionize = async (callback, params) => {
    if (!process.env.USE_DB) {
        return callback(...params);
    }
    const client = await database_1.startTransaction();
    try {
        return await callback(...params, client);
    }
    catch (e) {
        database_1.rollbackTransaction(client);
        console.error("Transaction rolled back!", e);
    }
    finally {
        database_1.endTransaction(client);
    }
};
exports.transactionize = transactionize;

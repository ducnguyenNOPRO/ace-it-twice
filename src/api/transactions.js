// api/transactions.js
import { getFunctions, httpsCallable } from "firebase/functions";

export async function fetchTransactions(itemId) {
    if (!itemId) throw new Error("Missing itemId");

    const functions = getFunctions();
    const getTransactions = httpsCallable(functions, "getTransactions");

    const { data } = await getTransactions({ itemId });
    const transactions = data.transactions.map((tx) => ({
        id: tx.transaction_id,
        ...tx
    }))
    return transactions
}
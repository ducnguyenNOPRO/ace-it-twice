// api/transactions.js
import { getFunctions, httpsCallable } from "firebase/functions";

export async function getTransactions({ itemId }) {
    if (!itemId) throw new Error("Missing itemId");

    const functions = getFunctions();
    const getTransactions = httpsCallable(functions, "getTransactions");

    const { data } = await getTransactions({ itemId });
    return data.transactions;
}
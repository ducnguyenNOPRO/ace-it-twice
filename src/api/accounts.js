// api/transactions.js
import { getFunctions, httpsCallable } from "firebase/functions";

export async function getAccounts({ itemId }) {
    if (!itemId) throw new Error("Missing itemId");

    const functions = getFunctions();
    const getAccounts = httpsCallable(functions, "getAccounts");

    const { data } = await getAccounts({ itemId });
    return data.accounts;
}
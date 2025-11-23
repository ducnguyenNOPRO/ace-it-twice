// api/transactions.js
import { httpsCallable } from "firebase/functions";
import showToastDuringAsync from "../util/showToastDuringAsync";
import { functions } from "../firebase/firebase";

export async function fetchTransactionsFromPlaid(itemId) {
    if (!itemId) throw new Error("Frontend: Missing itemId");

    const fetchTransactions = httpsCallable(functions, "fetchTransactionsFromPlaid");
    await fetchTransactions({ itemId });
}

export async function getTransactionsFilteredPaginated(params = {}) {
    if (!params.itemId) throw new Error("Frontend: Missing itemId");

    const getTransactionsFilteredPaginated = httpsCallable(functions, "getTransactionsFilteredPaginated");
    try {
        const { data } = await getTransactionsFilteredPaginated(params);
        return data;
    } catch (error) {
        console.error('Firebase function error:', error);
        throw error;
    }
}

export async function getRecentTransactions(params = {}) {
    if (!params.itemId) throw new Error("Frontend: Missing itemId");

    const getRecentTransacitons = httpsCallable(functions, "getRecentTransactions");
    try {
        const { data } = await getRecentTransacitons(params);
        return data;
    } catch (error) {
        console.error('Firebase function error:', error);
        throw error;
    }
}
export async function getMonthlyTransactions(params = {}) {
    if (!params.itemId) throw new Error("Frontend: Missing itemId");
    if (!params.date) throw new Error("FrontEnd:", "Missing month and year");

    const getMonthlyTransactions = httpsCallable(functions, "getMonthlyTransactions");
    try {
        const { data } = await getMonthlyTransactions(params);
        return data;
    } catch (error) {
        console.error('Firebase function error:', error);
        throw error;
    }
}
export async function get3MonthTransactionsPerCategory(params = {}) {
    if (!params.itemId) throw new Error("Frontend: Missing itemId");
    if (!params.date) throw new Error("FrontEnd:", "Missing month and year");
    if (!params.category) throw new Error("FrontEnd:", "Missing category");

    const get3MonthTransactionsPerCategory = httpsCallable(functions, "get3MonthTransactionsPerCategory");
    try {
        const { data } = await get3MonthTransactionsPerCategory(params);
        return data;
    } catch (error) {
        console.error('Firebase function error:', error);
        throw error;
    }
}

export async function addTransaction(transactionData, itemId, onClose) {
    if (!itemId) throw new Error("Frontend: Missing itemId");
    if (!transactionData) throw new Error("Frontend: Missing transaction to add");

    const addTransaction = httpsCallable(functions, "addTransaction");
    await showToastDuringAsync(
        addTransaction({ transaction: transactionData, itemId }),
        {
            loadingMessage: "Adding Transaction...",
            successMessage: "Transaction added successfully",
            errorMessage: "Failed to add transaction. Try again later",
            onClose: () => {
                onClose();
            }
        }
    )
}

export async function editTransactionById(transactionToUpdateId, transactionData, itemId, onClose) {
    if (!transactionToUpdateId) throw new Error("Frontend: Missing transactionId");
    if (!transactionData) throw new Error("Frontend: Missing transaction to update");
    if (!itemId) throw new Error("Frontend: Missing itemId");
    if (!transactionData) throw new Error("Frontend: Missing transaction to saved");

    const editTransactionById = httpsCallable(functions, "editTransactionById");
    await showToastDuringAsync(
        editTransactionById({ transactionToUpdateId, transactionData, itemId }),
        {
            loadingMessage: "Saving Transaction...",
            successMessage: "Transaction updated successfully",
            errorMessage: "Failed to update transaction. Try again later",
            onClose: () => {
                onClose();
            }
        }
    )
}

export async function deleteSingleTransaction(transactionToDeleteId, itemId) {
    if (!itemId) throw new Error("Frontend: Missing itemId");
    if (!transactionToDeleteId) throw new Error("Frontend: Missing transactionId");

    const deleteTransactionById = httpsCallable(functions, "deleteTransactionById");
    await showToastDuringAsync(
        deleteTransactionById({transactionToDeleteId, itemId}),
        {
        loadingMessage: "Deleting transaction...",
        successMessage: "Transaction deleted successfully",
        errorMessage: "Failed to delete transaction. Try again later",
        }
    )
}

export async function deleteBatchTransaction(selectedTransactionIds, itemId) {
    if (!itemId) throw new Error("Frontend: Missing itemId");
    if (selectedTransactionIds.length === 0) {
        console.log("No transactions to delete");
        return;
    }

    const deleteBatchTransaction = httpsCallable(functions, "deleteBatchTransaction");
    const {data} = await showToastDuringAsync(
        deleteBatchTransaction({selectedTransactionIds, itemId}),
        {
        loadingMessage: `Deleting ${selectedTransactionIds.length} transactions...`,
        successMessage: `${selectedTransactionIds.length} transaction deleted successfully`,
        errorMessage: `Failed to delete ${selectedTransactionIds.length} transactions. Try again later`,
        }
    )
    return data;
}
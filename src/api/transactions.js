// api/transactions.js
import { httpsCallable } from "firebase/functions";
import showToastDuringAsync from "../util/showToastDuringAsync";
import { functions } from "../firebase/firebase";

export async function fetchTransactionsFromPlaid(itemId) {
    if (!itemId) throw new Error("Frontend: Missing itemId");

    const fetchTransactions = httpsCallable(functions, "fetchTransactionsFromPlaid");
    await fetchTransactions({ itemId });
}

export async function getTransactions({ itemId }) {
    if (!itemId) throw new Error("Frontend: Missing itemId");

    const getTransactions = httpsCallable(functions, "getTransactions");
    const { data } = await getTransactions({ itemId });

    return data.transactions;
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

export async function editTransactionById(transactionId, transactionData, itemId, onClose) {
    if (!transactionId) throw new Error("Frontend: Missing transactionId");
    if (!transactionData) throw new Error("Frontend: Missing transaction to update");
    if (!itemId) throw new Error("Frontend: Missing itemId");
    if (!transactionData) throw new Error("Frontend: Missing transaction to saved");

    const editTransactionById = httpsCallable(functions, "editTransactionById");
    await showToastDuringAsync(
        editTransactionById({ transactionId, transaction: transactionData, itemId }),
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

export async function deleteSingleTransaction(transactionId, itemId) {
    if (!itemId) throw new Error("Frontend: Missing itemId");
    if (!transactionId) throw new Error("Frontend: Missing transactionId");

    const deleteTransactionById = httpsCallable(functions, "deleteTransactionById");
    await showToastDuringAsync(
        deleteTransactionById({transactionId, itemId}),
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
    const result = await showToastDuringAsync(
        deleteBatchTransaction({selectedTransactionIds, itemId}),
        {
        loadingMessage: `Deleting ${selectedTransactionIds.length} transactions...`,
        successMessage: `${selectedTransactionIds.length} transaction deleted successfully`,
        errorMessage: `Failed to delete ${selectedTransactionIds.length} transactions. Try again later`,
        }
    )
    return result;
}
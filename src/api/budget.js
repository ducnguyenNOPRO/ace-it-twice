import showToastDuringAsync from "../util/showToastDuringAsync";
import { functions } from "../firebase/firebase";
import { httpsCallable } from "firebase/functions";

export async function getBudgets(params = {}) {
    const getBudgets = httpsCallable(functions, "getBudgets");
    try {
        const { data } = await getBudgets(params);
        return data;
    } catch (error) {
        console.error('Firebase function error:', error);
        throw error;
    }
}
export async function getAverageBudget(params = {}) {
    const requestData = params;
    const getAverageBudget = httpsCallable(functions, "getAverageBudget");
    try {
        const { data } = await getAverageBudget({ requestData });
        return data;
    } catch (error) {
        console.error('Firebase function error:', error);
        throw error;
    }
}

export async function addBudget(budgetData, onClose) {
    if (!budgetData) throw new Error("Frontend: Missing budget to add");

    const addBudget = httpsCallable(functions, "addBudget");
    await showToastDuringAsync(
        addBudget({ budgetData }),
        {
            loadingMessage: "Adding budget...",
            successMessage: "Budget added successfully",
            errorMessage: "Failed to add Budget. Try again later",
            onClose: () => {
                onClose();
            }
        }
    )
}

export async function addMultipleBudgets(budgetArray, onClose) {
    if (!budgetArray) throw new Error("Frontend: Missing budget to add");

    const addMultipleBudgets = httpsCallable(functions, "addMultipleBudgets");
    await showToastDuringAsync(
        addMultipleBudgets({ budgetArray }),
        {
            loadingMessage: "Adding budget...",
            successMessage: "Budget added successfully",
            errorMessage: "Failed to add Budget. Try again later",
            onClose: () => {
                onClose();
            }
        }
    )
}

export async function editBudgetById(budgetToUpdateId, budgetData, onClose) {
    if (!budgetToUpdateId) throw new Error("Frontend: Missing BudgetId");
    if (!budgetData) throw new Error("Frontend: Missing budget data");

    const editBudgetById = httpsCallable(functions, "editBudgetById");
    await showToastDuringAsync(
        editBudgetById({ budgetToUpdateId, budgetData }),
        {
            loadingMessage: "Saving Budget...",
            successMessage: "Budget updated successfully",
            errorMessage: "Failed to update Budget. Try again later",
            onClose: () => {
                onClose();
            }
        }
    )
}

export async function editMultipleBudgets(budgetArray, onClose) {
    if (!budgetArray || budgetArray.length === 0) throw new Error("Frontend: Missing budgetArray");

    const editMultipleBudgets = httpsCallable(functions, "editMultipleBudgets");
    await showToastDuringAsync(
        editMultipleBudgets({ budgetArray }),
        {
            loadingMessage: "Saving Budget...",
            successMessage: "Budget updated successfully",
            errorMessage: "Failed to update Budget. Try again later",
            onClose: () => {
                onClose();
            }
        }
    )
}